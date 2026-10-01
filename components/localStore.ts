"use client";

import { useSyncExternalStore } from "react";

/**
 * A small value kept in localStorage and shared by every component that reads
 * it, in this tab and across tabs. Falls back to memory when storage is refused.
 */
export function localStore<T>(key: string, fallback: T) {
  let value: T | undefined;
  const listeners = new Set<() => void>();
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const get = (): T => (value ??= read());
  const set = (next: T) => {
    value = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    listeners.forEach((l) => l());
  };
  const subscribe = (onChange: () => void) => {
    listeners.add(onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      value = read();
      onChange();
    };
    addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      removeEventListener("storage", onStorage);
    };
  };
  /** Server renders and the first client render use the fallback. */
  const use = (): T => useSyncExternalStore(subscribe, get, () => fallback);
  return { get, set, use };
}
