"use client";

import { useEffect, useState } from "react";
import { ALL_PLACES, SAMPLE_LOCATION } from "@/lib/content";
import { distanceMeters, type LatLng } from "@/lib/geo";

/** The catalogue only has sample places, so far-away listeners stay in the sample area. */
const MAX_DISTANCE_M = 50_000;

/**
 * The listener's position. Starts at the sample location and switches to the
 * browser's position if the listener allows it and is near a pinned place.
 */
export function useLocation(): { here: LatLng; isSample: boolean } {
  const [state, setState] = useState({ here: SAMPLE_LOCATION as LatLng, isSample: true });
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (ALL_PLACES.some((p) => distanceMeters(here, p) < MAX_DISTANCE_M)) setState({ here, isSample: false });
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 60_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  return state;
}
