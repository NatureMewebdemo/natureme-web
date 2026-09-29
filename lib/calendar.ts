import type { CalendarEvent } from "./companion";

/**
 * Anything that can list a listener's busy times. Google Calendar plugs in
 * here once OAuth is set up; until then the Companion uses sampleCalendar.
 */
export interface CalendarSource {
  busy(from: Date, to: Date): Promise<CalendarEvent[]>;
}

function at(day: Date, h: number, m = 0): Date {
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

/** A sample afternoon with a 40-minute gap from 2:40 to 3:20. */
export const sampleCalendar: CalendarSource = {
  async busy(from) {
    return [
      { title: "Design review", start: at(from, 13), end: at(from, 14) },
      { title: "Budget check-in", start: at(from, 14), end: at(from, 14, 40) },
      { title: "Product sync", start: at(from, 15, 20), end: at(from, 16, 20) },
      { title: "Writing time", start: at(from, 16, 20), end: at(from, 17) },
    ];
  },
};
