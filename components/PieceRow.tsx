"use client";

import { FORMATS, piece as getPiece } from "@/lib/content";
import { priceLabel } from "@/lib/studio";
import { Cover } from "./Cover";
import { Pause, Play } from "./icons";
import { usePlayer } from "./Player";

export function PieceRow({ id }: { id: string }) {
  const p = getPiece(id);
  const { nowId, playing, play } = usePlayer();
  const on = nowId === id && playing;
  return (
    <button className="row" onClick={() => play(id)}>
      <Cover piece={p} />
      <div className="txt">
        <div className="t">
          {p.title}
          {p.was && <span className="badge">WAS</span>}
          {p.uploaded && <span className="badge">New</span>}
          {p.price && <span className="badge price">{priceLabel(p.price)}</span>}
        </div>
        <div className="m">
          {FORMATS[p.format].short} · <span className="mono">{p.length}</span> · {p.by}
        </div>
      </div>
      <span className="play" aria-label={on ? "Pause" : "Play"}>{on ? <Pause /> : <Play />}</span>
    </button>
  );
}

export function PieceList({ ids, className }: { ids: string[]; className?: string }) {
  return <div className={`list ${className ?? ""}`}>{ids.map((id) => <PieceRow key={id} id={id} />)}</div>;
}
