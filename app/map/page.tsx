"use client";

import { useState } from "react";
import { PieceList } from "@/components/PieceRow";
import { PlaceMap } from "@/components/PlaceMap";
import { useLocation } from "@/components/useLocation";
import { piecesAt, REGIONS, type RegionId } from "@/lib/content";
import { walkMinutes } from "@/lib/geo";

export default function MapPage() {
  const { here } = useLocation();
  const [regionId, setRegionId] = useState<RegionId>("near");
  const region = REGIONS[regionId];
  const [selected, setSelected] = useState(region.places[0].id);
  const [notify, setNotify] = useState(true);
  const place = region.places.find((p) => p.id === selected) ?? region.places[0];
  const ids = piecesAt(place.id).map((p) => p.id);
  const distance = regionId === "near" ? `${walkMinutes(here, place)} min walk` : "On your trip";

  return (
    <div className="screen">
      <div>
        <div className="eyebrow">The Map</div>
        <h1 style={{ fontSize: 28, marginTop: 6 }}>Hear where you are</h1>
        <p className="sec-sub" style={{ maxWidth: "36ch" }}>Creators pin audio to places: a park, a beach, a trail, a zoo, an eco resort, a whole valley.</p>
      </div>
      <div style={{ position: "relative" }}>
        <PlaceMap region={region} regionKey={regionId} selected={place.id} onSelect={setSelected} here={regionId === "near" ? here : undefined} />
        <div className="map-float">
          {(Object.keys(REGIONS) as RegionId[]).map((k) => (
            <button key={k} className="chip" aria-pressed={regionId === k} onClick={() => { setRegionId(k); setSelected(REGIONS[k].places[0].id); }}>
              {REGIONS[k].label}
            </button>
          ))}
        </div>
      </div>
      <div className="place">
        <div className="place-top">
          <div><div className="kind">{place.kind} · {distance}</div><h3 style={{ marginTop: 4 }}>{place.name}</h3></div>
          <span className="mono note">{ids.length} pinned</span>
        </div>
        <PieceList ids={ids} />
      </div>
      <div className="toggle-row">
        <div><b>Tell me when I&apos;m near something</b><p>Pieces pinned to where you&apos;re standing rise to the top of Home.</p></div>
        <button className="switch" role="switch" aria-checked={notify} aria-label="Nearby alerts" onClick={() => setNotify(!notify)} />
      </div>
      <div className="steps3">
        <div className="step3"><b>Explore by place</b><span>See what&apos;s been recorded near you, or somewhere you&apos;re travelling to.</span></div>
        <div className="step3"><b>Arrive and listen</b><span>Pieces pinned to where you&apos;re standing rise to the top of the app.</span></div>
      </div>
    </div>
  );
}
