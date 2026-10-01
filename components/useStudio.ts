"use client";

import { useSyncExternalStore } from "react";
import { setUploadedPieces } from "@/lib/content";
import { EMPTY_PROFILE, toPiece, type CreatorProfile, type Upload } from "@/lib/studio";

// The Studio keeps everything in this browser until NatureMe has accounts and
// file storage: upload details and audio files in IndexedDB (audio is too big
// for localStorage), the creator profile and listening totals in localStorage.

export interface Listens {
  seconds: number;
  plays: number;
  /** Times a listener bought a paid piece. */
  sales?: number;
}

export interface StudioState {
  loaded: boolean;
  /** False when the browser refuses IndexedDB (some private windows); uploads then last until reload. */
  persistent: boolean;
  uploads: Upload[];
  profile: CreatorProfile;
  /** Object URLs for uploaded audio files, by upload id. */
  audio: Record<string, string>;
  listens: Record<string, Listens>;
  /** Paid pieces the listener on this device has bought. */
  owned: string[];
}

const PROFILE_KEY = "natureme.creator.v1";
const LISTENS_KEY = "natureme.listens.v1";
const OWNED_KEY = "natureme.owned.v1";
const DB = "natureme-studio";

const SERVER: StudioState = { loaded: false, persistent: true, uploads: [], profile: EMPTY_PROFILE, audio: {}, listens: {}, owned: [] };
let state = SERVER;
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;

function update(next: Partial<StudioState>) {
  state = { ...state, ...next };
  setUploadedPieces(
    state.uploads.filter((u) => u.status === "published").map((u) => toPiece(u, state.profile.name, u.audioUrl ?? state.audio[u.id])),
  );
  listeners.forEach((l) => l());
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or refused; the in-memory copy still works.
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("uploads", { keyPath: "id" });
      req.result.createObjectStore("audio");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(stores: string[], mode: IDBTransactionMode, run: (t: IDBTransaction) => IDBRequest<T> | void): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(stores, mode);
        const req = run(t);
        t.oncomplete = () => {
          db.close();
          resolve(req ? req.result : undefined);
        };
        t.onerror = () => reject(t.error);
      }),
  );
}

async function load() {
  const profile = readJson(PROFILE_KEY, EMPTY_PROFILE);
  const listens = readJson<Record<string, Listens>>(LISTENS_KEY, {});
  const owned = readJson<{ ids: string[] }>(OWNED_KEY, { ids: [] }).ids;
  try {
    const uploads = (await tx<Upload[]>(["uploads"], "readonly", (t) => t.objectStore("uploads").getAll())) ?? [];
    const audio: Record<string, string> = {};
    await tx(["audio"], "readonly", (t) => {
      const store = t.objectStore("audio");
      for (const u of uploads) {
        if (u.source !== "upload") continue;
        const r = store.get(u.id);
        r.onsuccess = () => {
          if (r.result instanceof Blob) audio[u.id] = URL.createObjectURL(r.result);
        };
      }
    });
    uploads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    update({ loaded: true, uploads, audio, profile, listens, owned });
  } catch {
    update({ loaded: true, persistent: false, profile, listens, owned });
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  loading ??= load();
  return () => listeners.delete(onChange);
}

/** The creator's uploads, profile and listening totals; loads on first use. */
export function useStudio(): StudioState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

/** Loads the Studio store so published uploads appear in the Listener view. */
export function StudioSync() {
  useStudio();
  return null;
}

export async function saveUpload(u: Upload, file?: Blob): Promise<void> {
  const audio = { ...state.audio };
  if (file) {
    if (audio[u.id]) URL.revokeObjectURL(audio[u.id]);
    audio[u.id] = URL.createObjectURL(file);
  }
  const uploads = [u, ...state.uploads.filter((x) => x.id !== u.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  update({ uploads, audio });
  if (!state.persistent) return;
  await tx(["uploads", "audio"], "readwrite", (t) => {
    t.objectStore("uploads").put(u);
    if (file) t.objectStore("audio").put(file, u.id);
  });
}

export async function saveUploads(list: Upload[]): Promise<void> {
  const ids = new Set(list.map((u) => u.id));
  update({ uploads: [...list, ...state.uploads.filter((x) => !ids.has(x.id))].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  if (!state.persistent) return;
  await tx(["uploads"], "readwrite", (t) => {
    for (const u of list) t.objectStore("uploads").put(u);
  });
}

export async function deleteUpload(id: string): Promise<void> {
  const audio = { ...state.audio };
  if (audio[id]) URL.revokeObjectURL(audio[id]);
  delete audio[id];
  update({ uploads: state.uploads.filter((u) => u.id !== id), audio });
  if (!state.persistent) return;
  await tx(["uploads", "audio"], "readwrite", (t) => {
    t.objectStore("uploads").delete(id);
    t.objectStore("audio").delete(id);
  });
}

export function saveProfile(profile: CreatorProfile) {
  writeJson(PROFILE_KEY, profile);
  update({ profile });
}

const isUpload = (id: string) => state.uploads.some((u) => u.id === id);

/** Credits listened seconds to an upload's creator. Sample pieces are ignored. */
export function creditListen(id: string, seconds: number) {
  if (!isUpload(id) || seconds <= 0) return;
  const cur = state.listens[id] ?? { seconds: 0, plays: 0 };
  const listens = { ...state.listens, [id]: { ...cur, seconds: cur.seconds + seconds } };
  writeJson(LISTENS_KEY, listens);
  update({ listens });
}

export function creditPlay(id: string) {
  if (!isUpload(id)) return;
  const cur = state.listens[id] ?? { seconds: 0, plays: 0 };
  const listens = { ...state.listens, [id]: { ...cur, plays: cur.plays + 1 } };
  writeJson(LISTENS_KEY, listens);
  update({ listens });
}

export const isOwned = (id: string) => state.owned.includes(id);

/**
 * A listener buys a paid piece. There is no payment provider yet, so this
 * unlocks it on this device and counts the sale for the creator.
 */
export function buy(id: string) {
  if (isOwned(id)) return;
  const owned = [...state.owned, id];
  writeJson(OWNED_KEY, { ids: owned });
  const cur = state.listens[id] ?? { seconds: 0, plays: 0 };
  const listens = { ...state.listens, [id]: { ...cur, sales: (cur.sales ?? 0) + 1 } };
  writeJson(LISTENS_KEY, listens);
  update({ owned, listens });
}

export function newId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
