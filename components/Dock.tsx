"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ALL_PLACES, FORMATS, piece } from "@/lib/content";
import { clock, lengthSeconds } from "@/lib/duration";
import { Cover } from "./Cover";
import { Close, Compass, Home, MapPin, Pause, Play, User } from "./icons";
import { WELCOME_PATH } from "./OnboardingGate";
import { DEMO_SPEED, usePlayer } from "./Player";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/map", label: "Map", Icon: MapPin },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

export function Dock() {
  const path = usePathname();
  const { nowId, playing, position, toggle, openSheet } = usePlayer();
  const p = nowId ? piece(nowId) : null;
  if (path === WELCOME_PATH) return null;
  return (
    <div className="dock">
      {p && (
        <div style={{ position: "relative" }}>
          <span className="prog" style={{ width: `${Math.min(100, (position / lengthSeconds(p.length)) * 100)}%` }} />
          <div className="mini">
            <button onClick={() => openSheet(true)} style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, minWidth: 0 }}>
              <Cover piece={p} />
              <span className="txt">
                <div className="t">{p.title}</div>
                <div className="m">{p.by}</div>
              </span>
            </button>
            <button className="play" onClick={toggle} aria-label={playing ? "Pause" : "Play"} style={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid var(--line)" }}>
              {playing ? <Pause /> : <Play />}
            </button>
          </div>
        </div>
      )}
      <nav className="tabs">
        {TABS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={path === href || (href === "/profile" && path === "/companion") ? "page" : undefined} className="tab">
            <Icon />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Wave({ seedText, done }: { seedText: string; done: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const x = cv?.getContext("2d");
    if (!cv || !x) return;
    const w = (cv.width = cv.clientWidth * 2), h = (cv.height = cv.clientHeight * 2);
    const css = getComputedStyle(document.documentElement);
    let seed = [...seedText].reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const n = 64, bw = w / n;
    x.clearRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const bh = (0.2 + 0.8 * Math.abs(Math.sin(i * 0.35 + r() * 2)) * (0.5 + r() * 0.5)) * h * 0.9;
      x.fillStyle = i / n < done ? css.getPropertyValue("--ink") : css.getPropertyValue("--line");
      x.fillRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh);
    }
  }, [seedText, done]);
  return <canvas ref={ref} className="wave" />;
}

export function PlayerSheet() {
  const { nowId, playing, position, listened, sheetOpen, toggle, seek, openSheet } = usePlayer();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openSheet(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [openSheet]);
  if (!nowId || !sheetOpen) return null;
  const p = piece(nowId);
  const total = lengthSeconds(p.length);
  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && openSheet(false)}>
      <div className="sheet-in" role="dialog" aria-label="Now playing">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="eyebrow">Now playing · {FORMATS[p.format].name}</span>
          <button onClick={() => openSheet(false)} aria-label="Close"><Close /></button>
        </div>
        <Cover piece={p} className="big-art" />
        <div>
          <h2>{p.title}</h2>
          <p className="by" style={{ marginTop: 4 }}>{p.by}</p>
        </div>
        <Wave seedText={p.title} done={position / total} />
        <div className="times"><span>{clock(position)}</span><span>-{clock(total - position)}</span></div>
        <div className="controls">
          <button className="skip" onClick={() => seek(-15)}>↺<span>15</span></button>
          <button className="pp" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={26} /> : <Play size={26} />}</button>
          <button className="skip" onClick={() => seek(30)}>↻<span>30</span></button>
        </div>
        <div className="meta-grid">
          <div><span>Pinned to</span><b>{ALL_PLACES.find((pl) => pl.id === p.placeId)?.name ?? "Anywhere"}</b></div>
          <div><span>You&apos;ve listened</span><b className="mono">{(listened / 60).toFixed(1)} min</b></div>
        </div>
        <p className="demo-flag">No audio files yet. Time runs at {DEMO_SPEED}× speed so you can see minutes count toward the creator.</p>
      </div>
    </div>
  );
}
