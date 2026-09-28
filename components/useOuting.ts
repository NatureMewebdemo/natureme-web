"use client";

import { useEffect, useState } from "react";
import { sampleCalendar } from "@/lib/calendar";
import { findGaps, suggestOuting, type Suggestion } from "@/lib/companion";
import { ALL_PLACES, type Place } from "@/lib/content";
import type { LatLng } from "@/lib/geo";

/** Today's first calendar gap that fits a walk to a pinned place. */
export function useOuting(here: LatLng): Suggestion<Place> | null {
  const [s, setS] = useState<Suggestion<Place> | null>(null);
  useEffect(() => {
    let live = true;
    const day = new Date();
    const from = new Date(day); from.setHours(13, 0, 0, 0);
    const to = new Date(day); to.setHours(17, 0, 0, 0);
    sampleCalendar.busy(from, to).then((events) => {
      if (!live) return;
      for (const gap of findGaps(events, from, to, 30)) {
        const hit = suggestOuting(gap, here, ALL_PLACES);
        if (hit) return setS(hit);
      }
      setS(null);
    });
    return () => { live = false; };
  }, [here]);
  return s;
}

export function timeRange(a: Date, b: Date): string {
  const f = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${f(a)}–${f(b)}`;
}
