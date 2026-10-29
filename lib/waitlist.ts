/** The coming-soon page's waitlist: creators who want early access, and listeners who want to hear when it opens. */

export type WaitlistRole = "creator" | "listener";

export const CREATOR_FORMATS = ["Podcast", "Audiobook", "Audiobook summary", "Meditation", "Place story", "Music"] as const;

export type WaitlistEntry = {
  role: WaitlistRole;
  name: string;
  email: string;
  /** Creators only. */
  formats: string[];
  /** Creators only: where their audio belongs. */
  place: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = 200;

/** Checks and tidies a sign-up. Returns the entry, or a sentence saying what to fix. */
export function parseWaitlistEntry(input: unknown): { entry: WaitlistEntry } | { error: string } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const text = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, MAX) : "");
  const role: WaitlistRole = raw.role === "listener" ? "listener" : "creator";
  const email = text(raw.email).toLowerCase();
  if (!EMAIL.test(email)) return { error: "Enter an email address like you@example.com." };
  const creator = role === "creator";
  const formats = creator && Array.isArray(raw.formats)
    ? raw.formats.filter((f): f is string => typeof f === "string" && (CREATOR_FORMATS as readonly string[]).includes(f))
    : [];
  return { entry: { role, name: text(raw.name), email, formats, place: creator ? text(raw.place) : "" } };
}
