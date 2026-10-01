import { WAYS, type FormatId, type WayId } from "./content";

/** What the listener picked during onboarding. Kept in the browser until accounts exist. */
export interface Preferences {
  /** What Home calls the listener. Optional: older saves and skipped onboarding have none. */
  name?: string;
  traditions: string[];
  formats: FormatId[];
  location: "allowed" | "skipped";
  calendar: "sample" | "skipped";
  completedAt: string;
}

const KEY = "natureme.preferences.v1";
/** Fired on window when preferences change in this tab (the storage event only covers other tabs). */
export const PREFERENCES_EVENT = "natureme:preferences";

export function loadRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function parsePreferences(raw: string | null): Preferences | null {
  try {
    return raw ? (JSON.parse(raw) as Preferences) : null;
  } catch {
    return null;
  }
}

export function loadPreferences(): Preferences | null {
  return parsePreferences(loadRaw());
}

export function savePreferences(p: Preferences): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    dispatchEvent(new Event(PREFERENCES_EVENT));
  } catch {
    // Private windows can refuse storage; onboarding will just show again.
  }
}

export function clearPreferences(): void {
  try {
    localStorage.removeItem(KEY);
    dispatchEvent(new Event(PREFERENCES_EVENT));
  } catch {}
}

/**
 * Pieces from the traditions the listener chose, filtered to their formats
 * when they picked any, in the order the traditions were chosen.
 */
export function forYou(p: Pick<Preferences, "traditions" | "formats">, pieceFormat: (id: string) => FormatId, limit = 6): string[] {
  const byId = new Map(
    (Object.keys(WAYS) as WayId[]).flatMap((w) => WAYS[w].traditions).map((t) => [t.id, t]),
  );
  const ids = p.traditions.flatMap((t) => byId.get(t)?.pieceIds ?? []);
  const fitting = p.formats.length ? ids.filter((id) => p.formats.includes(pieceFormat(id))) : ids;
  return [...new Set(fitting.length ? fitting : ids)].slice(0, limit);
}
