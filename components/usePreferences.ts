"use client";

import { useMemo, useSyncExternalStore } from "react";
import { loadRaw, parsePreferences, type Preferences } from "@/lib/preferences";

const subscribe = (onChange: () => void) => {
  addEventListener("storage", onChange);
  return () => removeEventListener("storage", onChange);
};

/** Stored preferences; `undefined` while rendering on the server. */
export function usePreferences(): Preferences | null | undefined {
  // The raw string is stable between reads, so React can compare snapshots.
  const raw = useSyncExternalStore(subscribe, loadRaw, () => undefined);
  return useMemo(() => (raw === undefined ? undefined : parsePreferences(raw)), [raw]);
}
