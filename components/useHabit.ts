"use client";

import { findPiece } from "@/lib/content";
import { DEFAULT_REMINDER, EMPTY_HABIT, recordListen, resumeAt, type HabitState } from "@/lib/habit";
import { localStore } from "./localStore";

const store = localStore<HabitState>("natureme.habit.v1", EMPTY_HABIT);

export const useHabit = store.use;

/** Counts listening toward today's goal and remembers where the listener stopped. */
export function trackListen(id: string, from: number, to: number) {
  const p = findPiece(id);
  if (p) store.set(recordListen(store.get(), p, from, to, new Date()));
}

export function resumePosition(id: string): number {
  const p = findPiece(id);
  return p ? resumeAt(store.get(), p) : 0;
}

export function setGoal(pieceId: string, perDay: number, reminder = store.get().goal?.reminder ?? DEFAULT_REMINDER) {
  const s = store.get();
  const same = s.goal?.pieceId === pieceId;
  store.set({ ...s, goal: { pieceId, perDay, reminder, startedAt: same && s.goal ? s.goal.startedAt : new Date().toISOString() } });
}

export function setReminder(reminder: string) {
  const s = store.get();
  if (s.goal) store.set({ ...s, goal: { ...s.goal, reminder } });
}

export function clearGoal() {
  store.set({ ...store.get(), goal: null });
}
