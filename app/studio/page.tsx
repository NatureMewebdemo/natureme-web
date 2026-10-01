"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Cover } from "@/components/Cover";
import { Pause, Play } from "@/components/icons";
import { usePlayer } from "@/components/Player";
import { Rss, UploadIcon } from "@/components/studio/icons";
import { deleteUpload, saveUpload, useStudio } from "@/components/useStudio";
import { ALL_PLACES, FORMATS } from "@/lib/content";
import { canPublish, earnings, lengthLabel, money, RATE_PER_MINUTE, runChecks, toPiece, type Upload } from "@/lib/studio";

function Flash() {
  const params = useSearchParams();
  const { uploads } = useStudio();
  const id = params.get("published");
  const count = Number(params.get("imported") ?? 0);
  const u = id ? uploads.find((x) => x.id === id) : undefined;
  if (u) {
    const place = ALL_PLACES.find((p) => p.id === u.placeId);
    return (
      <div className="flash">
        <span>“{u.title}” is live for listeners{place ? `, pinned to ${place.name}` : ""}.</span>
        <Link href={place ? "/map" : "/explore"}>See it in the Listener view</Link>
      </div>
    );
  }
  if (count) return <div className="flash"><span>Imported {count} episode{count === 1 ? "" : "s"} from the feed.</span></div>;
  return null;
}

export default function StudioDashboard() {
  const { loaded, persistent, uploads, profile, listens, audio } = useStudio();
  const { nowId, playing, play } = usePlayer();
  const published = uploads.filter((u) => u.status === "published");
  const seconds = uploads.reduce((a, u) => a + (listens[u.id]?.seconds ?? 0), 0);
  const plays = uploads.reduce((a, u) => a + (listens[u.id]?.plays ?? 0), 0);
  const top = Math.max(1, ...uploads.map((u) => listens[u.id]?.seconds ?? 0));

  const setStatus = (u: Upload, status: Upload["status"]) =>
    saveUpload({ ...u, status, publishedAt: status === "published" ? new Date().toISOString() : u.publishedAt });
  const remove = (u: Upload) => {
    if (confirm(`Delete “${u.title}”? Listeners won't hear it any more.`)) deleteUpload(u.id);
  };

  return (
    <>
      <Suspense><Flash /></Suspense>
      <div className="studio-head">
        <div className="eyebrow">Creator Studio</div>
        <h1 style={{ marginTop: 6 }}>{profile.name ? `Welcome back, ${profile.name}` : "Share what you hear outside"}</h1>
        <p>Upload stories, courses, audiobooks, summaries, podcasts and meditations, pin them to the places they belong, and earn for every minute people listen.</p>
      </div>

      {!profile.name && loaded && (
        <Link href="/studio/profile" className="creator-link">
          <span>Set up your creator profile so listeners know who made what they hear.</span>
          <b>Set up</b>
        </Link>
      )}

      <div className="stats">
        <div className="stat"><b className="mono">{published.length}</b><span>published</span></div>
        <div className="stat"><b className="mono">{plays}</b><span>plays</span></div>
        <div className="stat"><b className="mono">{(seconds / 60).toFixed(1)}</b><span>minutes listened</span></div>
        <div className="stat accent"><b className="mono">{money(earnings(seconds))}</b><span>earned</span></div>
      </div>

      <div className="studio-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Your audio</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/studio/import" className="mini-btn"><Rss size={15} />Podcast feed</Link>
              <Link href="/studio/upload" className="btn solid" style={{ padding: "7px 14px" }}><UploadIcon size={16} />Upload</Link>
            </div>
          </div>
          {!loaded ? (
            <p className="note">Loading…</p>
          ) : uploads.length === 0 ? (
            <div className="empty">
              <h3>Nothing here yet</h3>
              <p>Upload a recording, or bring in your podcast from its RSS feed. NatureMe reads each episode and suggests the places it talks about.</p>
              <div className="row-btns">
                <Link href="/studio/upload" className="btn solid"><UploadIcon size={16} />Upload audio</Link>
                <Link href="/studio/import" className="btn line"><Rss size={16} />Import a podcast</Link>
              </div>
            </div>
          ) : (
            <div>
              {uploads.map((u) => {
                const place = ALL_PLACES.find((p) => p.id === u.placeId);
                const l = listens[u.id];
                const ready = canPublish(runChecks({ ...u, hasAudio: !!(u.audioUrl || audio[u.id]) }));
                const on = nowId === u.id && playing;
                return (
                  <div key={u.id} className="content-row">
                    <Cover piece={toPiece(u, profile.name)} />
                    <div style={{ minWidth: 0 }}>
                      <div className="t">{u.title}</div>
                      <div className="m">
                        {FORMATS[u.format].short} · <span className="mono">{lengthLabel(u.durationSec)}</span> · {place ? place.name : "No place"}
                        {u.source === "rss" && " · from feed"}
                      </div>
                      <div className="m mono">{l ? `${l.plays} play${l.plays === 1 ? "" : "s"} · ${(l.seconds / 60).toFixed(1)} min · ${money(earnings(l.seconds))}` : "No listens yet"}</div>
                    </div>
                    <span className={`status ${u.status}`}>{u.status === "published" ? "Live" : "Draft"}</span>
                    <div className="acts">
                      {u.status === "published" && (
                        <button className="mini-btn" onClick={() => play(u.id)} aria-label={on ? "Pause" : "Play"}>{on ? <Pause size={12} /> : <Play size={12} />}{on ? "Pause" : "Play"}</button>
                      )}
                      <Link className="mini-btn" href={`/studio/upload?id=${u.id}`}>Edit</Link>
                      {u.status === "published" ? (
                        <button className="mini-btn" onClick={() => setStatus(u, "draft")}>Unpublish</button>
                      ) : (
                        <button className="mini-btn" onClick={() => setStatus(u, "published")} disabled={!ready} title={ready ? undefined : "Open Edit to fix what the checks found"}>Publish</button>
                      )}
                      <button className="mini-btn danger" onClick={() => remove(u)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!persistent && <p className="note">This browser won&apos;t let NatureMe store files, so uploads last until you reload the page.</p>}
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="panel">
            <h2>Earnings</h2>
            <p className="note">Paid per minute listened. Sample rate: {money(RATE_PER_MINUTE)} a minute. Payouts start once NatureMe has accounts.</p>
            <div className="earn">
              {published.length === 0 && <p className="note">Publish something to start earning.</p>}
              {published.map((u) => {
                const s = listens[u.id]?.seconds ?? 0;
                return (
                  <div key={u.id} className="earn-row" style={{ ["--c" as string]: `var(${FORMATS[u.format].color})` }}>
                    <span>{u.title}</span>
                    <span className="mono">{money(earnings(s))}</span>
                    <span className="bar"><i style={{ width: `${(s / top) * 100}%` }} /></span>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="panel">
            <h2>How listeners find you</h2>
            <div className="how">
              <div className="step3"><b>Pinned on the Map</b><span>Listeners near the place, or planning a trip there, see your piece.</span></div>
              <div className="step3"><b>In Explore</b><span>Tag a school of thought, culture or faith.</span></div>
              <div className="step3"><b>On a walk</b><span>The Companion picks pinned pieces for gaps in people&apos;s day.</span></div>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
