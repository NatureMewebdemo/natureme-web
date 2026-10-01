"use client";

import { localStore } from "./localStore";

// Geofenced pieces the listener has captured by hearing them on site.
const store = localStore<string[]>("natureme.captured.v1", []);

export const useCaptured = store.use;
export const capturedNow = store.get;

export function capture(id: string) {
  const ids = store.get();
  if (!ids.includes(id)) store.set([...ids, id]);
}
