/** Seconds for a display length like "14 min" or "6 h 20 min"; lessons count as 12 minutes. */
export function lengthSeconds(length: string): number {
  const h = /(\d+)\s*h\s*(\d+)?/.exec(length);
  if (h) return (Number(h[1]) * 60 + Number(h[2] ?? 0)) * 60;
  const m = /(\d+)\s*min/.exec(length);
  if (m) return Number(m[1]) * 60;
  return 12 * 60;
}

export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`;
}
