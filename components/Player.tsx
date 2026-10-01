"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { findPiece, piece, type Piece } from "@/lib/content";
import { pieceSeconds } from "@/lib/duration";
import { creditListen, creditPlay } from "./useStudio";

/** Sample pieces have no audio yet, so their playback is simulated at ten times real speed. */
export const DEMO_SPEED = 10;

interface PlayerState {
  nowId: string | null;
  playing: boolean;
  position: number;
  /** Seconds listened this session; this is what creators are paid on. */
  listened: number;
  sheetOpen: boolean;
}

interface PlayerApi extends PlayerState {
  play(id: string): void;
  toggle(): void;
  seek(delta: number): void;
  openSheet(open: boolean): void;
}

const Ctx = createContext<PlayerApi | null>(null);

/** The piece, or null when an upload was deleted while it was playing. */
function find(id: string | null): Piece | null {
  return (id && findPiece(id)) || null;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<PlayerState>({ nowId: null, playing: false, position: 0, listened: 0, sheetOpen: false });
  const state = useRef(s);
  useEffect(() => {
    state.current = s;
  });
  const audio = useRef<HTMLAudioElement | null>(null);
  const src = find(s.nowId)?.audio;

  // Simulated playback for sample pieces.
  useEffect(() => {
    if (!s.playing || !s.nowId || src) return;
    const id = s.nowId;
    const total = pieceSeconds(piece(id));
    const t = setInterval(() => {
      const p = state.current;
      const position = Math.min(total, p.position + DEMO_SPEED);
      const delta = position - p.position;
      creditListen(id, delta);
      set({ ...p, position, listened: p.listened + delta, playing: position < total });
    }, 1000);
    return () => clearInterval(t);
  }, [s.playing, s.nowId, src]);

  // Real playback for creator uploads.
  useEffect(() => {
    const a = (audio.current ??= new Audio());
    const onTime = () => {
      const p = state.current;
      if (!p.nowId) return;
      const delta = a.currentTime - p.position;
      // Only steady forward play counts toward the creator, not seeks.
      const counted = !a.paused && delta > 0 && delta < 2 ? delta : 0;
      if (counted) creditListen(p.nowId, counted);
      set({ ...p, position: a.currentTime, listened: p.listened + counted });
    };
    const onEnd = () => set((p) => ({ ...p, playing: false }));
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.pause();
    };
  }, []);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (!src) {
      a.pause();
      return;
    }
    if (a.dataset.id !== s.nowId) {
      a.dataset.id = s.nowId ?? "";
      a.src = src;
    }
    if (s.playing) a.play().catch(() => set((p) => ({ ...p, playing: false })));
    else a.pause();
  }, [src, s.nowId, s.playing]);

  const play = useCallback((id: string) => {
    if (state.current.nowId !== id) creditPlay(id);
    set((p) => (p.nowId === id ? { ...p, playing: !p.playing } : { ...p, nowId: id, position: 0, playing: true, sheetOpen: true }));
  }, []);
  const toggle = useCallback(() => {
    set((p) => {
      const cur = find(p.nowId);
      if (!cur) return p;
      const done = p.position >= pieceSeconds(cur) - 0.5;
      if (done && audio.current && cur.audio) audio.current.currentTime = 0;
      return { ...p, playing: !p.playing, position: done ? 0 : p.position };
    });
  }, []);
  const seek = useCallback((delta: number) => {
    const p = state.current;
    const cur = find(p.nowId);
    if (!cur) return;
    const position = Math.max(0, Math.min(pieceSeconds(cur), p.position + delta));
    if (cur.audio && audio.current) audio.current.currentTime = position;
    set({ ...p, position });
  }, []);
  const openSheet = useCallback((open: boolean) => set((p) => ({ ...p, sheetOpen: open })), []);

  const api = useMemo(() => ({ ...s, play, toggle, seek, openSheet }), [s, play, toggle, seek, openSheet]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function usePlayer(): PlayerApi {
  const api = useContext(Ctx);
  if (!api) throw new Error("usePlayer must be used inside PlayerProvider");
  return api;
}
