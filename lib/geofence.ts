// Geofenced listening: some pieces only play where they were recorded, so
// listening means going outside. Hearing one on site "captures" it, Pokémon Go
// style, and it stays the listener's to replay anywhere.

import { ALL_PLACES, type Piece, type Place } from "./content";
import { distanceMeters, isInside, walkMinutes, type LatLng } from "./geo";

/**
 * - open: plays anywhere (not geofenced)
 * - here: geofenced, and the listener is inside its place
 * - captured: geofenced, already heard on site, so it plays anywhere
 * - away: geofenced, and the listener has to go there first
 */
export type Fence = "open" | "here" | "captured" | "away";

export function fencedPlace(p: Pick<Piece, "onSite" | "placeId">): Place | undefined {
  return p.onSite && p.placeId ? ALL_PLACES.find((pl) => pl.id === p.placeId) : undefined;
}

export function fenceOf(p: Pick<Piece, "id" | "onSite" | "placeId">, here: LatLng, captured: readonly string[]): Fence {
  const place = fencedPlace(p);
  if (!place) return "open";
  if (captured.includes(p.id)) return "captured";
  return isInside(here, place) ? "here" : "away";
}

/** "12 min walk", or the distance in km when it's too far to walk. */
export function howFar(here: LatLng, place: Place): string {
  const m = Math.max(0, distanceMeters(here, place) - place.radius);
  if (m > 10_000) return `${Math.round(m / 1000).toLocaleString("en-US")} km away`;
  return `${walkMinutes(here, place)} min walk`;
}

/** Walking directions in Google Maps. */
export function directionsUrl(place: Place): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=walking`;
}

/** Geofenced pieces at a place, split into captured and still to find. */
export function fieldTally(pieces: Pick<Piece, "id" | "onSite" | "placeId">[], captured: readonly string[]): { total: number; captured: number } {
  const fenced = pieces.filter((p) => fencedPlace(p));
  return { total: fenced.length, captured: fenced.filter((p) => captured.includes(p.id)).length };
}
