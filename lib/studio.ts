// Creator side of NatureMe: what a creator uploads, the automated checks it
// goes through, keyword pinning to places, and per-minute earnings.
// Pure functions only; storage lives in components/useStudio.ts.

import { FORMATS, REGIONS, type FormatId, type Piece, type Place, type RegionId } from "./content";

export type UploadStatus = "draft" | "published";

export interface Upload {
  id: string;
  title: string;
  description: string;
  format: FormatId;
  /** Explore traditions (schools, cultures, faiths) this piece belongs to. */
  traditionIds: string[];
  placeId?: string;
  durationSec: number;
  /** What listeners pay to own it, in US dollars; free when absent or 0. */
  price?: number;
  status: UploadStatus;
  source: "upload" | "rss";
  /** Remote audio for RSS episodes; uploaded files are kept as blobs on the device. */
  audioUrl?: string;
  fileName?: string;
  /** Feed the episode came from. */
  feedTitle?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface CreatorProfile {
  name: string;
  bio: string;
  website: string;
}

export const EMPTY_PROFILE: CreatorProfile = { name: "", bio: "", website: "" };

/** Sample payout rate until real pricing exists, in US dollars per listened minute. */
export const RATE_PER_MINUTE = 0.005;

export function earnings(seconds: number, rate = RATE_PER_MINUTE): number {
  return (seconds / 60) * rate;
}

export const PRICE_MIN = 0.99;
export const PRICE_MAX = 99.99;

export const isPaid = (price: number | undefined): price is number => !!price && price > 0;

/** Audiobooks are usually sold; everything else starts free. Creators can change either. */
export function defaultPrice(format: FormatId): number | undefined {
  return format === "audiobook" ? 9.99 : undefined;
}

export function priceLabel(price: number | undefined): string {
  return isPaid(price) ? money(price) : "Free";
}

/**
 * What a piece has earned the creator: free pieces are paid per listened
 * minute, paid pieces by what listeners pay for them. The platform's cut is
 * not decided yet, so this is the gross amount.
 */
export function pieceEarnings(price: number | undefined, l: { seconds: number; sales?: number } | undefined): number {
  if (!l) return 0;
  return isPaid(price) ? price * (l.sales ?? 0) : earnings(l.seconds);
}

export function money(usd: number): string {
  return usd.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: usd < 1 ? 3 : 2 });
}

/** "14 min", "1 h 5 min"; the listener app shows lengths as text. */
export function lengthLabel(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), rest = m % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}

/** The Listener view's shape for a published upload. */
export function toPiece(u: Upload, creator: string, audio?: string): Piece {
  return {
    id: u.id,
    format: u.format,
    title: u.title,
    length: lengthLabel(u.durationSec),
    seconds: u.durationSec,
    by: creator ? `By ${creator}` : "By a NatureMe creator",
    placeId: u.placeId,
    price: isPaid(u.price) ? u.price : undefined,
    audio,
    uploaded: true,
    traditionIds: u.traditionIds,
  };
}

export interface Check {
  id: string;
  label: string;
  ok: boolean;
  /** Blocking checks stop publishing; the rest are advice. */
  blocking: boolean;
  detail?: string;
}

// A stand-in for AI moderation: a short list of things that never belong on NatureMe.
const BLOCKED = ["hate", "kill yourself", "porn", "nazi", "terroris"];
const SPAMMY = ["buy now", "discount code", "click here", "free money", "crypto"];

/**
 * Automated quality checks run before publishing, in place of manual
 * pre-screening (direction from the WAS call). Real AI moderation of the
 * audio itself needs a server; these look at what the creator typed.
 */
export function runChecks(u: Pick<Upload, "title" | "description" | "format" | "durationSec" | "placeId" | "traditionIds" | "price"> & { hasAudio: boolean }): Check[] {
  const text = `${u.title} ${u.description}`.toLowerCase();
  const blocked = BLOCKED.filter((w) => text.includes(w));
  const spam = SPAMMY.filter((w) => text.includes(w));
  const min = u.durationSec / 60;
  return [
    { id: "audio", label: "Audio file attached", ok: u.hasAudio, blocking: true },
    { id: "length", label: "At least 30 seconds long", ok: u.durationSec >= 30, blocking: true },
    { id: "title", label: "Title between 4 and 90 characters", ok: u.title.trim().length >= 4 && u.title.trim().length <= 90, blocking: true },
    { id: "safe", label: "Nothing harmful in the title or description", ok: blocked.length === 0, blocking: true, detail: blocked.length ? `Flagged: ${blocked.join(", ")}` : undefined },
    { id: "price", label: "Free, or priced between $0.99 and $99.99", ok: !u.price || (u.price >= PRICE_MIN && u.price <= PRICE_MAX), blocking: true },
    { id: "description", label: "Description tells listeners what they'll hear", ok: u.description.trim().length >= 40, blocking: false, detail: "40 characters or more helps people choose." },
    { id: "spam", label: "No sales or spam language", ok: spam.length === 0, blocking: false, detail: spam.length ? `Found: ${spam.join(", ")}` : undefined },
    { id: "fit", label: `Length suits ${FORMATS[u.format].plural.toLowerCase()}`, ok: fitsFormat(u.format, min), blocking: false, detail: formatHint(u.format) },
    { id: "place", label: "Pinned to a place on the map", ok: !!u.placeId, blocking: false, detail: "Pinned pieces show up on the Map and when listeners walk by." },
    { id: "tradition", label: "Tagged with a school, culture or faith", ok: u.traditionIds.length > 0, blocking: false, detail: "Tags put the piece in Explore." },
  ];
}

function fitsFormat(f: FormatId, min: number): boolean {
  switch (f) {
    case "meditation": return min <= 60;
    case "story": return min <= 45;
    case "summary": return min <= 40;
    case "audiobook": return min >= 30;
    default: return true;
  }
}

function formatHint(f: FormatId): string | undefined {
  return { meditation: "Meditations are usually under an hour.", story: "Stories are usually under 45 minutes.", summary: "Summaries are usually under 40 minutes.", audiobook: "Audiobooks are usually longer than 30 minutes." }[f as string];
}

export const canPublish = (checks: Check[]) => checks.every((c) => c.ok || !c.blocking);

// Generic words that name a kind of place rather than a specific one.
const GENERIC = new Set(["park", "beach", "trail", "zoo", "eco", "lodge", "valley", "river", "bay", "forest", "reserve", "upland", "point", "whole", "resort", "the"]);
const REGION_HINTS: Record<RegionId, string[]> = {
  near: ["pacific northwest", "seattle", "puget", "washington state", "cascadia"],
  hilo: ["hawaii", "hawaiʻi", "hilo", "big island", "hawaiian"],
};

export interface PlaceSuggestion {
  placeId: string;
  score: number;
  /** The words in the text that matched, for showing the creator why. */
  matched: string[];
}

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯʻ‘’']/g, "");

/**
 * Keyword flagging for auto-pinning: finds places a title, description or
 * transcript mentions. A place's own name counts most; its kind ("beach",
 * "trail") and its region ("Hawaii") only add weight.
 */
export function suggestPlaces(text: string, regions = REGIONS): PlaceSuggestion[] {
  const t = ` ${fold(text).replace(/[^a-z0-9 ]+/g, " ")} `;
  const has = (w: string) => t.includes(` ${fold(w)} `) || t.includes(` ${fold(w)}s `);
  const out: PlaceSuggestion[] = [];
  for (const [rid, region] of Object.entries(regions) as [RegionId, { places: Place[] }][]) {
    const regionHits = REGION_HINTS[rid]?.filter(has) ?? [];
    for (const p of region.places) {
      const matched: string[] = [];
      let score = 0;
      if (has(p.name)) { score += 4; matched.push(p.name); }
      else {
        for (const w of fold(p.name).split(/\s+/)) {
          if (w.length > 3 && !GENERIC.has(w) && has(w)) { score += 2; matched.push(w); }
        }
      }
      for (const w of fold(p.kind).split(/\s+/)) {
        if (GENERIC.has(w) && w !== "the" && w !== "whole" && has(w)) { score += 0.5; matched.push(w); }
      }
      if (regionHits.length) { score += 1; matched.push(...regionHits); }
      if (score >= 2) out.push({ placeId: p.id, score, matched: [...new Set(matched)] });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

/** Seconds from an itunes:duration value: "3723", "62:03" or "1:02:03". */
export function parseDuration(v: string | undefined): number {
  if (!v) return 0;
  const parts = v.trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

export interface FeedEpisode {
  guid: string;
  title: string;
  description: string;
  audioUrl: string;
  durationSec: number;
  published?: string;
}

export interface Feed {
  title: string;
  episodes: FeedEpisode[];
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

/** Plain text from feed HTML: tags dropped, whitespace collapsed. */
function text(s: string | undefined): string {
  return s ? decode(decode(s).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim() : "";
}

function tag(xml: string, name: string): string | undefined {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(xml);
  return m?.[1];
}

function attr(el: string, name: string): string | undefined {
  const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(el);
  return m ? decode(m[2] ?? m[3]) : undefined;
}

/** Reads a podcast RSS feed: show title and episodes that have an audio enclosure. */
export function parseRss(xml: string, limit = 50): Feed {
  const channel = tag(xml, "channel") ?? xml;
  const head = channel.split(/<item[\s>]/i)[0];
  const items = channel.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const episodes: FeedEpisode[] = [];
  for (const item of items) {
    const enclosure = /<enclosure\b[^>]*>/i.exec(item)?.[0];
    const audioUrl = enclosure && attr(enclosure, "url");
    if (!audioUrl || !/^https?:\/\//i.test(audioUrl)) continue;
    const type = enclosure && attr(enclosure, "type");
    if (type && !type.startsWith("audio/")) continue;
    episodes.push({
      guid: text(tag(item, "guid")) || audioUrl,
      title: text(tag(item, "title")) || "Untitled episode",
      description: text(tag(item, "itunes:summary") ?? tag(item, "description") ?? tag(item, "content:encoded")),
      audioUrl,
      durationSec: parseDuration(text(tag(item, "itunes:duration"))),
      published: text(tag(item, "pubDate")) || undefined,
    });
    if (episodes.length >= limit) break;
  }
  return { title: text(tag(head, "title")) || "Podcast", episodes };
}
