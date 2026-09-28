"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { piece } from "@/lib/content";
import { lengthSeconds } from "@/lib/duration";

/** There is no audio yet, so playback is simulated at ten times real speed. */
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

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<PlayerState>({ nowId: null, playing: false, position: 0, listened: 0, sheetOpen: false });

  useEffect(() => {
    if (!s.playing || !s.nowId) return;
    const total = lengthSeconds(piece(s.nowId).length);
    const t = setInterval(() => {
      set((p) => {
        const position = Math.min(total, p.position + DEMO_SPEED);
        return { ...p, position, listened: p.listened + (position - p.position), playing: position < total };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [s.playing, s.nowId]);

  const play = useCallback((id: string) => {
    set((p) => (p.nowId === id ? { ...p, playing: !p.playing } : { ...p, nowId: id, position: 0, playing: true, sheetOpen: true }));
  }, []);
  const toggle = useCallback(() => {
    set((p) => {
      if (!p.nowId) return p;
      const done = p.position >= lengthSeconds(piece(p.nowId).length);
      return { ...p, playing: !p.playing, position: done ? 0 : p.position };
    });
  }, []);
  const seek = useCallback((delta: number) => {
    set((p) => (p.nowId ? { ...p, position: Math.max(0, Math.min(lengthSeconds(piece(p.nowId).length), p.position + delta)) } : p));
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
