export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;
/** A relaxed walking pace, in metres per minute. */
export const WALK_M_PER_MIN = 80;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function walkMinutes(a: LatLng, b: LatLng): number {
  return Math.max(1, Math.round(distanceMeters(a, b) / WALK_M_PER_MIN));
}

/** Nearest first. */
export function byDistance<T extends LatLng>(here: LatLng, items: T[]): T[] {
  return [...items].sort((x, y) => distanceMeters(here, x) - distanceMeters(here, y));
}

/** True when `here` is inside a place's pinned area. */
export function isInside(here: LatLng, place: LatLng & { radius: number }): boolean {
  return distanceMeters(here, place) <= place.radius;
}
