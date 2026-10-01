// The daily habit: a listener picks something long (an audiobook, a course)
// and a goal of N chapters a day. Streaks count the days the goal was met,
// and a calendar reminder brings them back. Pure functions; storage lives in
// components/useHabit.ts.

import type { Piece } from "./content";
import { pieceSeconds } from "./duration";

export interface Goal {
  pieceId: string;
  /** Chapters (or lessons, or short pieces) to finish each day. */
  perDay: number;
  /** Daily reminder time, "HH:MM" in the listener's time zone. */
  reminder: string;
  startedAt: string;
}

export interface Day {
  chapters: number;
  seconds: number;
}

export interface HabitState {
  goal: Goal | null;
  /** By local date, "YYYY-MM-DD". */
  days: Record<string, Day>;
  /** Where the listener stopped in each piece, in seconds. */
  progress: Record<string, number>;
}

export const EMPTY_HABIT: HabitState = { goal: null, days: {}, progress: {} };
export const GOAL_CHOICES = [1, 2, 3];
export const DEFAULT_REMINDER = "07:30";
/** Long pieces offered when the listener has nothing in progress. */
export const HABIT_SUGGESTIONS = ["edge-woods", "birdsong", "sit-spot-seasons", "noticing"];

/** Audiobooks without chapter marks are split into half-hour chapters. */
const CHAPTER_SECONDS = 30 * 60;

/** Lessons for courses, pieces for collections, half-hour chapters for long audio; short pieces are one chapter. */
export function chapterCount(p: Pick<Piece, "length" | "seconds" | "format">): number {
  const n = /(\d+)\s*(lessons?|pieces?|chapters?)/.exec(p.length);
  if (n) return Math.max(1, Number(n[1]));
  const s = pieceSeconds(p);
  return p.format === "audiobook" || s > 45 * 60 ? Math.max(1, Math.round(s / CHAPTER_SECONDS)) : 1;
}

export function chapterWord(p: Pick<Piece, "format" | "collection">, plural = false): string {
  const w = p.format === "course" ? "lesson" : p.collection ? "piece" : "chapter";
  return plural ? `${w}s` : w;
}

/** 0-based chapter at a position. */
export function chapterAt(p: Pick<Piece, "length" | "seconds" | "format">, position: number): number {
  const n = chapterCount(p);
  return Math.min(n - 1, Math.floor((position / pieceSeconds(p)) * n));
}

/** Chapters finished by playing from `from` to `to` seconds. Reaching the end finishes the last one. */
export function chaptersCrossed(p: Pick<Piece, "length" | "seconds" | "format">, from: number, to: number): number {
  if (to <= from) return 0;
  const total = pieceSeconds(p);
  const n = chapterCount(p);
  const done = (pos: number) => (pos >= total - 0.5 ? n : Math.floor((pos / total) * n));
  return Math.max(0, done(to) - done(from));
}

/** Days left at the goal's pace, counting today. */
export function daysToFinish(p: Pick<Piece, "length" | "seconds" | "format">, position: number, perDay: number): number {
  const left = chapterCount(p) - chapterAt(p, position) - (position >= pieceSeconds(p) - 0.5 ? 1 : 0);
  return Math.max(0, Math.ceil(left / perDay));
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Days in a row the goal was met, ending today. A goal not yet met today
 * doesn't break the streak until the day is over.
 */
export function streak(days: Record<string, Day>, perDay: number, today: Date): number {
  const met = (d: Date) => (days[dayKey(d)]?.chapters ?? 0) >= perDay;
  let d = met(today) ? today : addDays(today, -1);
  let n = 0;
  while (met(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** The last seven days, oldest first, for the week strip. */
export function week(days: Record<string, Day>, perDay: number, today: Date): { key: string; label: string; met: boolean; today: boolean }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    const key = dayKey(d);
    return { key, label: d.toLocaleDateString("en-US", { weekday: "narrow" }), met: (days[key]?.chapters ?? 0) >= perDay, today: i === 6 };
  });
}

/** Adds listening from `from` to `to` seconds in a piece to today's tally. */
export function recordListen(s: HabitState, p: Pick<Piece, "id" | "length" | "seconds" | "format">, from: number, to: number, now: Date): HabitState {
  const key = dayKey(now);
  const day = s.days[key] ?? { chapters: 0, seconds: 0 };
  const listened = Math.max(0, to - from);
  return {
    ...s,
    days: { ...s.days, [key]: { chapters: day.chapters + chaptersCrossed(p, from, to), seconds: day.seconds + listened } },
    progress: { ...s.progress, [p.id]: to },
  };
}

/** Where to start a piece: where the listener stopped, or the beginning if they finished it. */
export function resumeAt(s: HabitState, p: Pick<Piece, "id" | "length" | "seconds">): number {
  const at = s.progress[p.id] ?? 0;
  return at >= pieceSeconds(p) - 0.5 ? 0 : at;
}

const icsDate = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;

/**
 * A daily calendar event that reminds the listener to come back for today's
 * chapter. Works in any calendar app with no account or push server.
 */
export function reminderIcs(o: { time: string; title: string; url: string; now: Date }): string {
  const [h, m] = o.time.split(":").map(Number);
  const start = new Date(o.now);
  start.setHours(h, m, 0, 0);
  if (start <= o.now) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + 15 * 60_000);
  const esc = (t: string) => t.replace(/([,;\\])/g, "\\$1");
  const stamp = o.now.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NatureMe//Daily listening//EN",
    "BEGIN:VEVENT",
    `UID:natureme-daily-${stamp}@natureme`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    "RRULE:FREQ=DAILY",
    `SUMMARY:${esc(o.title)}`,
    `DESCRIPTION:${esc(`Today's chapter is waiting: ${o.url}`)}`,
    `URL:${o.url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(o.title)}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
