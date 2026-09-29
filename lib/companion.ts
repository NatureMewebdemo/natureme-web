import { byDistance, walkMinutes, type LatLng } from "./geo";

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}

export interface Gap {
  start: Date;
  end: Date;
  minutes: number;
}

const MIN = 60_000;

/**
 * Free stretches between `from` and `to` that last at least `minMinutes`.
 * Overlapping and out-of-order events are handled.
 */
export function findGaps(events: CalendarEvent[], from: Date, to: Date, minMinutes = 30): Gap[] {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const gaps: Gap[] = [];
  let cursor = from.getTime();
  const push = (end: number) => {
    const minutes = Math.floor((end - cursor) / MIN);
    if (minutes >= minMinutes) gaps.push({ start: new Date(cursor), end: new Date(end), minutes });
  };
  for (const e of sorted) {
    const s = e.start.getTime();
    if (s >= to.getTime()) break;
    if (s > cursor) push(s);
    cursor = Math.max(cursor, e.end.getTime());
  }
  if (cursor < to.getTime()) push(to.getTime());
  return gaps;
}

export interface Suggestion<P> {
  gap: Gap;
  place: P;
  walkMinutes: number;
  /** Minutes left at the place once the walk there and back is taken out. */
  minutesThere: number;
}

/**
 * Picks the nearest place the listener can walk to, spend at least
 * `minMinutesThere` at, and walk back from before the gap ends.
 */
export function suggestOuting<P extends LatLng>(
  gap: Gap,
  here: LatLng,
  places: P[],
  minMinutesThere = 15,
): Suggestion<P> | null {
  for (const place of byDistance(here, places)) {
    const walk = walkMinutes(here, place);
    const minutesThere = gap.minutes - 2 * walk;
    if (minutesThere >= minMinutesThere) return { gap, place, walkMinutes: walk, minutesThere };
  }
  return null;
}
