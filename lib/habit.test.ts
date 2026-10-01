import { describe, expect, it } from "vitest";
import { PIECES } from "./content";
import { chapterAt, chapterCount, chaptersCrossed, daysToFinish, EMPTY_HABIT, recordListen, reminderIcs, resumeAt, streak, week } from "./habit";

const book = PIECES["edge-woods"]; // 6 h 20 min audiobook
const course = PIECES["birdsong"]; // 6 lessons
const story = PIECES["old-cedars"]; // 14 min
const day = (d: number) => new Date(2026, 9, d, 9);

describe("chapters", () => {
  it("counts lessons, half-hour audiobook chapters, and short pieces as one", () => {
    expect(chapterCount(course)).toBe(6);
    expect(chapterCount(book)).toBe(13);
    expect(chapterCount(story)).toBe(1);
  });

  it("finds the chapter at a position and the chapters crossed", () => {
    const lesson = (6 * 12 * 60) / 6;
    expect(chapterAt(course, 0)).toBe(0);
    expect(chapterAt(course, lesson * 2.5)).toBe(2);
    expect(chaptersCrossed(course, lesson * 0.5, lesson * 2.1)).toBe(2);
    expect(chaptersCrossed(course, lesson * 2.1, lesson * 2.2)).toBe(0);
    expect(chaptersCrossed(story, 0, 14 * 60)).toBe(1);
  });

  it("estimates days left at the goal's pace", () => {
    expect(daysToFinish(course, 0, 1)).toBe(6);
    expect(daysToFinish(course, 0, 2)).toBe(3);
    expect(daysToFinish(book, 0, 3)).toBe(5);
  });
});

describe("recordListen and resumeAt", () => {
  it("adds finished chapters and seconds to today and remembers the position", () => {
    const lesson = 12 * 60;
    let s = recordListen(EMPTY_HABIT, course, 0, lesson - 10, day(1));
    expect(s.days["2026-10-01"]).toEqual({ chapters: 0, seconds: lesson - 10 });
    s = recordListen(s, course, lesson - 10, lesson + 10, day(1));
    expect(s.days["2026-10-01"].chapters).toBe(1);
    expect(resumeAt(s, course)).toBe(lesson + 10);
  });

  it("starts a finished piece over", () => {
    const s = recordListen(EMPTY_HABIT, story, 0, 14 * 60, day(1));
    expect(resumeAt(s, story)).toBe(0);
  });
});

describe("streak", () => {
  const days = { "2026-09-29": { chapters: 1, seconds: 1 }, "2026-09-30": { chapters: 2, seconds: 1 }, "2026-10-01": { chapters: 1, seconds: 1 } };

  it("counts days in a row that met the goal", () => {
    expect(streak(days, 1, day(1))).toBe(3);
    expect(streak(days, 2, day(1))).toBe(1); // yesterday met 2; today is still open
  });

  it("doesn't break the streak before today is over", () => {
    expect(streak(days, 1, day(2))).toBe(3);
    expect(streak(days, 1, day(3))).toBe(0);
  });

  it("lays out the last seven days", () => {
    const w = week(days, 1, day(1));
    expect(w).toHaveLength(7);
    expect(w[6]).toMatchObject({ key: "2026-10-01", met: true, today: true });
    expect(w.filter((d) => d.met)).toHaveLength(3);
  });
});

describe("reminderIcs", () => {
  it("makes a daily event at the reminder time, starting tomorrow if it has passed", () => {
    const ics = reminderIcs({ time: "07:30", title: "NatureMe: today's chapter", url: "https://natureme-web.vercel.app", now: day(1) });
    expect(ics).toContain("DTSTART:20261002T073000");
    expect(ics).toContain("RRULE:FREQ=DAILY");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});
