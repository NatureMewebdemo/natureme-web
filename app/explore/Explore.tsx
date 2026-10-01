"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PieceList } from "@/components/PieceRow";
import { useStudio } from "@/components/useStudio";
import { FORMATS, piece, traditionPieceIds, uploadedPieces, WAYS, type FormatId, type WayId } from "@/lib/content";

export function Explore() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const way = (params.get("way") as WayId) in WAYS ? (params.get("way") as WayId) : "schools";
  const fmtParam = params.get("format");
  const format = fmtParam && fmtParam in FORMATS ? (fmtParam as FormatId) : null;
  const w = WAYS[way];
  useStudio(); // re-render when creators publish
  const fresh = uploadedPieces().filter((p) => !format || p.format === format).map((p) => p.id);

  const go = (next: { way?: WayId; format?: FormatId | null }) => {
    const q = new URLSearchParams(params);
    if (next.way) q.set("way", next.way);
    if (next.format !== undefined) {
      if (next.format) q.set("format", next.format);
      else q.delete("format");
    }
    router.replace(`${path}?${q}`, { scroll: false });
  };

  return (
    <div className="screen">
      <div className="seg" role="tablist">
        {(Object.keys(WAYS) as WayId[]).map((k) => (
          <button key={k} role="tab" aria-selected={way === k} onClick={() => go({ way: k })}>{WAYS[k].label}</button>
        ))}
      </div>
      <div className="way-intro">
        <div className="eyebrow">Three ways of seeing nature</div>
        <h1 style={{ marginTop: 6 }}>{w.label}</h1>
        <p>{w.sub}</p>
      </div>
      <div className="chips" role="group" aria-label="Filter by format">
        <button className="chip" aria-pressed={!format} onClick={() => go({ format: null })}>All formats</button>
        {(Object.keys(FORMATS) as FormatId[]).map((k) => (
          <button key={k} className="chip" aria-pressed={format === k} onClick={() => go({ format: k })} style={{ ["--c" as string]: `var(${FORMATS[k].color})` }}>
            <i />{FORMATS[k].short}
          </button>
        ))}
      </div>
      {fresh.length > 0 && (
        <section className="trad">
          <div className="trad-head"><h3>New from creators</h3><span className="n">{fresh.length} pieces</span></div>
          <PieceList ids={fresh} />
        </section>
      )}
      <div>
        {w.traditions.map((t) => {
          const all = traditionPieceIds(t);
          const ids = all.filter((id) => !format || piece(id).format === format);
          return (
            <div key={t.id} className="trad">
              <div className="trad-head">
                <h3>{t.name}{t.natureMeOriginal && <span className="badge">NatureMe original</span>}</h3>
                <span className="n">{all.length} pieces</span>
              </div>
              <p className="line">{t.line}</p>
              {ids.length ? <PieceList ids={ids} /> : <p className="note">No {FORMATS[format!].plural.toLowerCase()} here yet.</p>}
            </div>
          );
        })}
      </div>
      <p className="note">WAS: made by NatureMe with Wilderness Awareness School.</p>
      <Link href="/studio" className="creator-link"><span>Record nature audio? Publish it on NatureMe and earn per minute listened.</span><b>Studio</b></Link>
    </div>
  );
}
