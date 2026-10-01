"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveUploads, useStudio } from "@/components/useStudio";
import { ALL_PLACES, REGIONS, type RegionId } from "@/lib/content";
import { canPublish, lengthLabel, runChecks, suggestPlaces, type Feed, type FeedEpisode, type Upload } from "@/lib/studio";

/** Stable id per episode, so importing the same feed twice updates instead of duplicating. */
function episodeId(guid: string): string {
  let h = 5381;
  for (const ch of guid) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return `rss-${h.toString(36)}`;
}

interface Row {
  ep: FeedEpisode;
  id: string;
  on: boolean;
  placeId?: string;
  matched: string[];
  exists: boolean;
}

export default function ImportPage() {
  const router = useRouter();
  const { uploads } = useStudio();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feed, setFeed] = useState<Feed | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [publish, setPublish] = useState(true);

  const fetchFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFeed(null);
    try {
      const res = await fetch(`/api/feed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't read that feed.");
      const f = data as Feed;
      setFeed(f);
      setRows(
        f.episodes.map((ep) => {
          const id = episodeId(ep.guid);
          const best = suggestPlaces(`${ep.title} ${ep.description}`)[0];
          const exists = uploads.some((u) => u.id === id);
          return { ep, id, on: !exists, placeId: best?.placeId, matched: best?.matched ?? [], exists };
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that feed.");
    } finally {
      setBusy(false);
    }
  };

  const set = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const chosen = rows.filter((r) => r.on);
  const pinned = rows.filter((r) => r.placeId).length;

  const importChosen = async () => {
    if (!feed) return;
    const now = new Date().toISOString();
    const list: Upload[] = chosen.map((r, i) => {
      const prior = uploads.find((u) => u.id === r.id);
      const u: Upload = {
        id: r.id,
        title: r.ep.title.slice(0, 90),
        description: r.ep.description.slice(0, 2000),
        format: "podcast",
        traditionIds: prior?.traditionIds ?? [],
        placeId: r.placeId,
        // Feeds without itunes:duration get a placeholder length until the audio is read.
        durationSec: r.ep.durationSec || 30 * 60,
        status: "draft",
        source: "rss",
        audioUrl: r.ep.audioUrl,
        feedTitle: feed.title,
        // Keep feed order: newest first.
        createdAt: prior?.createdAt ?? new Date(Date.now() - i).toISOString(),
      };
      const ok = canPublish(runChecks({ ...u, hasAudio: true }));
      return publish && ok ? { ...u, status: "published", publishedAt: prior?.publishedAt ?? now } : u;
    });
    setBusy(true);
    await saveUploads(list);
    router.push(`/studio?imported=${list.length}`);
  };

  return (
    <>
      <div className="studio-head">
        <div className="eyebrow">Podcast feed</div>
        <h1 style={{ marginTop: 6 }}>Bring in your podcast</h1>
        <p>Paste your show&apos;s RSS feed. NatureMe reads each episode&apos;s title and notes, flags the places it mentions, and pins the episode there. Audio keeps playing from your podcast host.</p>
      </div>

      <form className="panel" onSubmit={fetchFeed}>
        <label className="form" style={{ gap: 6 }}>
          <span className="field-label">Feed address</span>
          <input className="input" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://feeds.example.com/your-show.xml" />
        </label>
        <div className="form-actions">
          <button className="btn solid" disabled={busy || !url}>{busy && !feed ? "Reading the feed…" : "Find episodes"}</button>
        </div>
        {error && <p className="err" role="alert">{error}</p>}
      </form>

      {feed && (
        <section className="panel">
          <div className="panel-head">
            <h2>{feed.title}</h2>
            <span className="note mono">{rows.length} episodes · {pinned} pinned automatically</span>
          </div>
          {rows.length === 0 ? (
            <p className="note">No episodes with audio in this feed.</p>
          ) : (
            <div>
              {rows.map((r, i) => (
                <div key={r.id} className="episode">
                  <input type="checkbox" checked={r.on} onChange={(e) => set(i, { on: e.target.checked })} aria-label={`Import ${r.ep.title}`} />
                  <div style={{ minWidth: 0 }}>
                    <div className="t">{r.ep.title}{r.exists && <span className="badge">Imported</span>}</div>
                    <div className="m mono">{r.ep.durationSec ? lengthLabel(r.ep.durationSec) : "Length unknown"}{r.ep.published ? ` · ${new Date(r.ep.published).toLocaleDateString()}` : ""}</div>
                    {r.ep.description && <p className="d">{r.ep.description}</p>}
                    {r.placeId && r.matched.length > 0 && <p className="m">Mentions {r.matched.map((m) => `“${m}”`).join(", ")}</p>}
                  </div>
                  <select className="input" value={r.placeId ?? ""} onChange={(e) => set(i, { placeId: e.target.value || undefined, matched: [] })} aria-label="Place">
                    <option value="">Not tied to a place</option>
                    {(Object.keys(REGIONS) as RegionId[]).map((rid) => (
                      <optgroup key={rid} label={rid === "near" ? "Pacific Northwest" : REGIONS[rid].label}>
                        {REGIONS[rid].places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          <div className="toggle-row" style={{ background: "var(--surface)" }}>
            <div><b>Publish right away</b><p>Episodes that pass the automated checks go live. The rest are saved as drafts.</p></div>
            <button type="button" className="switch" role="switch" aria-checked={publish} aria-label="Publish right away" onClick={() => setPublish(!publish)} />
          </div>
          <div className="form-actions">
            <button className="btn solid" disabled={busy || chosen.length === 0} onClick={importChosen}>
              Import {chosen.length} episode{chosen.length === 1 ? "" : "s"}
            </button>
          </div>
          <p className="note">Transcripts would sharpen the place matching; that needs speech-to-text on a server. {ALL_PLACES.length} places are on the map today.</p>
        </section>
      )}
    </>
  );
}
