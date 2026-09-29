"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Cover } from "@/components/Cover";
import { Globe, Lotus, Star, Walk } from "@/components/icons";
import { PieceList } from "@/components/PieceRow";
import { usePlayer } from "@/components/Player";
import { usePreferences } from "@/components/usePreferences";
import { useLocation } from "@/components/useLocation";
import { timeRange, useOuting } from "@/components/useOuting";
import { ALL_PLACES, FORMATS, piece, piecesAt, TOP_PICKS, WAYS, type FormatId, type WayId } from "@/lib/content";
import { byDistance, isInside } from "@/lib/geo";
import { clearPreferences, forYou } from "@/lib/preferences";

const WAY_ICONS: Record<WayId, typeof Lotus> = { schools: Lotus, cultures: Globe, faiths: Star };

function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// Home is prerendered, so the hour is only known in the browser.
const noSubscribe = () => () => {};

export default function HomePage() {
  const { here } = useLocation();
  const outing = useOuting(here);
  const { play } = usePlayer();
  const [snoozed, setSnoozed] = useState(false);
  const prefs = usePreferences();
  const hello = useSyncExternalStore(noSubscribe, greeting, () => null);
  const picks = prefs ? forYou(prefs, (id) => piece(id).format) : [];
  const nearest = byDistance(here, ALL_PLACES)[0];
  const inside = isInside(here, nearest);

  return (
    <div className="screen">
      <header className="hero">
        <Image src="/home-beach.jpg" alt="" fill priority sizes="(max-width: 430px) 100vw, 430px" className="hero-img" />
        <div className="hero-logo">
          <Image src="/logo-vertical.png" alt="NatureMe" width={78} height={75} priority />
        </div>
        <div className="hero-text">
          <h1>{hello && `${hello}${prefs?.name ? ` ${prefs.name}` : ""}`}</h1>
        </div>
      </header>

      {outing && !snoozed && prefs?.calendar !== "skipped" && (
        <div className="gap">
          <div className="eyebrow">Companion · a gap in your day</div>
          <h3>You have {outing.gap.minutes} free minutes. {outing.place.name} is {outing.walkMinutes} minutes away.</h3>
          <div className="gap-meta">
            <span className="mono">{timeRange(outing.gap.start, outing.gap.end)}</span>
            <span>{piecesAt(outing.place.id).length} pieces pinned there</span>
          </div>
          <div className="gap-actions">
            <Link className="btn primary" href="/companion"><Walk />Show me the walk</Link>
            <button className="btn ghost" onClick={() => setSnoozed(true)}>Not today</button>
          </div>
        </div>
      )}

      <section className="near">
        <div className="near-head"><span className="pulse" />{inside ? `You're in ${nearest.name}` : `Pinned near you · ${nearest.name}`}</div>
        <PieceList ids={piecesAt(nearest.id).map((p) => p.id)} className={inside ? "rise" : ""} />
      </section>

      {picks.length > 0 && (
        <section>
          <div className="sec-head">
            <div><h2>For you</h2><div className="sec-sub">From the traditions you chose</div></div>
            <Link href="/welcome" className="for-you-link" onClick={() => clearPreferences()}>Change</Link>
          </div>
          <div style={{ marginTop: 6 }}><PieceList ids={picks} /></div>
        </section>
      )}

      <section>
        <div className="sec-head"><div><h2>Top Picks this week</h2><div className="sec-sub">Chosen by NatureMe editors</div></div></div>
        <div className="rail" style={{ marginTop: 14 }}>
          {TOP_PICKS.map((id) => {
            const p = piece(id);
            return (
              <button key={id} className="pick" onClick={() => play(id)}>
                <Cover piece={p} className="art">
                  <span className="tag">{p.collection ? "Seasonal collection" : FORMATS[p.format].short}</span>
                  <span className="len">{p.length}</span>
                </Cover>
                <div><div className="t">{p.title}</div><div className="m">{p.by}</div></div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="sec-head"><h2>Three ways of seeing nature</h2></div>
        <div className="ways" style={{ marginTop: 14 }}>
          {(Object.keys(WAYS) as WayId[]).map((k) => {
            const w = WAYS[k], Icon = WAY_ICONS[k];
            return (
              <Link key={k} href={`/explore?way=${k}`} className="way" style={{ ["--g" as string]: `var(${w.color})`, ["--g-soft" as string]: `color-mix(in srgb,var(${w.color}) 16%,transparent)` }}>
                <span className="glyph"><Icon /></span>
                <span><h3>{w.label}</h3><p>{w.sub}</p></span>
                <span className="count">{w.traditions.length}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="sec-head"><div><h2>Everything you can hear</h2><div className="sec-sub">Six formats, published by creators</div></div></div>
        <div className="fmt-grid" style={{ marginTop: 14 }}>
          {(Object.keys(FORMATS) as FormatId[]).map((k) => (
            <Link key={k} href={`/explore?format=${k}`} className="fmt-card" style={{ ["--c" as string]: `var(${FORMATS[k].color})` }}>
              <b>{FORMATS[k].plural}</b><span>{FORMATS[k].description}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
