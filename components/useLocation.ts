"use client";

import { useSyncExternalStore } from "react";
import { ALL_PLACES, SAMPLE_LOCATION } from "@/lib/content";
import { distanceMeters, type LatLng } from "@/lib/geo";

/** The catalogue only has sample places, so far-away listeners stay in the sample area. */
const MAX_DISTANCE_M = 50_000;
const DEMO_KEY = "natureme.demo-place.v1";

export interface Location {
  here: LatLng;
  /** True when this is the sample location, not the listener's real one. */
  isSample: boolean;
  /** A place the listener is pretending to stand in, so geofenced pieces can be tried remotely. */
  demoPlaceId: string | null;
}

const SERVER: Location = { here: SAMPLE_LOCATION, isSample: true, demoPlaceId: null };
let real: LatLng | null = null;
let demo: string | null | undefined;
let snap = SERVER;
const listeners = new Set<() => void>();
let watchId: number | null = null;

function readDemo(): string | null {
  try {
    return sessionStorage.getItem(DEMO_KEY);
  } catch {
    return null;
  }
}

function recompute() {
  demo ??= readDemo();
  const place = demo ? ALL_PLACES.find((p) => p.id === demo) : undefined;
  snap = place
    ? { here: { lat: place.lat, lng: place.lng }, isSample: true, demoPlaceId: place.id }
    : real
      ? { here: real, isSample: false, demoPlaceId: null }
      : SERVER;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) {
    recompute();
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (ALL_PLACES.some((p) => distanceMeters(here, p) < MAX_DISTANCE_M)) {
            real = here;
            recompute();
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30_000 },
      );
    }
  }
  return () => {
    listeners.delete(onChange);
    if (!listeners.size && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };
}

/** Where the listener is right now, outside React (for the player's checks). */
export function currentLocation(): Location {
  return snap;
}

/** Demo only: pretend to stand in a place (null to go back to the real location). Lasts for this tab. */
export function setDemoPlace(placeId: string | null) {
  demo = placeId;
  try {
    if (placeId) sessionStorage.setItem(DEMO_KEY, placeId);
    else sessionStorage.removeItem(DEMO_KEY);
  } catch {}
  recompute();
}

/**
 * The listener's position. Starts at the sample location and switches to the
 * browser's position if the listener allows it and is near a pinned place.
 * Every component shares one location watch.
 */
export function useLocation(): Location {
  return useSyncExternalStore(subscribe, () => snap, () => SERVER);
}
