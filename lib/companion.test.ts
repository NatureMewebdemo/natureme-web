import { describe, expect, it } from "vitest";
import { findGaps, suggestOuting } from "./companion";
import { sampleCalendar } from "./calendar";
import { REGIONS, SAMPLE_LOCATION } from "./content";

const day = new Date(2026, 8, 28);
const at = (h: number, m = 0) => new Date(2026, 8, 28, h, m);

describe("findGaps", () => {
  it("finds the 40-minute gap in the sample afternoon", async () => {
    const events = await sampleCalendar.busy(day, day);
    const gaps = findGaps(events, at(13), at(17), 30);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].minutes).toBe(40);
    expect(gaps[0].start).toEqual(at(14, 40));
  });

  it("merges overlapping events and ignores short gaps", () => {
    const gaps = findGaps(
      [
        { title: "a", start: at(9), end: at(10, 30) },
        { title: "b", start: at(10), end: at(11) },
        { title: "c", start: at(11, 10), end: at(12) },
      ],
      at(9),
      at(13),
      30,
    );
    expect(gaps.map((g) => g.minutes)).toEqual([60]);
    expect(gaps[0].start).toEqual(at(12));
  });

  it("treats an empty calendar as one gap", () => {
    expect(findGaps([], at(9), at(10), 30)).toEqual([{ start: at(9), end: at(10), minutes: 60 }]);
  });
});

describe("suggestOuting", () => {
  it("sends the listener to the nearest park that fits the gap", () => {
    const gap = { start: at(14, 40), end: at(15, 20), minutes: 40 };
    const s = suggestOuting(gap, SAMPLE_LOCATION, REGIONS.near.places);
    expect(s?.place.id).toBe("lindenwood");
    expect(s!.walkMinutes).toBeLessThanOrEqual(6);
  });

  it("returns nothing when no place fits", () => {
    const gap = { start: at(14), end: at(14, 20), minutes: 20 };
    expect(suggestOuting(gap, SAMPLE_LOCATION, REGIONS.near.places, 15)).toBeNull();
  });
});
