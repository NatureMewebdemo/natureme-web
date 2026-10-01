"use client";

import { FORMATS, piece as getPiece } from "@/lib/content";
import { fenceOf } from "@/lib/geofence";
import { priceLabel } from "@/lib/studio";
import { Cover } from "./Cover";
import { Pause, Play } from "./icons";
import { usePlayer } from "./Player";
import { useCaptured } from "./useField";
import { useLocation } from "./useLocation";

const FENCE_BADGE = { away: "On site only", here: "Unlocked here", captured: "Captured" } as const;

export function PieceRow({ id }: { id: string }) {
  const p = getPiece(id);
  const { nowId, playing, play } = usePlayer();
  const on = nowId === id && playing;
  const { here } = useLocation();
  const fence = fenceOf(p, here, useCaptured());
  return (
    <button className="row" onClick={() => play(id)}>
      <Cover piece={p} />
      <div className="txt">
        <div className="t">
          {p.title}
          {p.was && <span className="badge">WAS</span>}
          {p.uploaded && <span className="badge">New</span>}
          {p.price && <span className="badge price">{priceLabel(p.price)}</span>}
          {fence !== "open" && <span className={`badge fence ${fence}`}>{FENCE_BADGE[fence]}</span>}
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
