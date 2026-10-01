"use client";

import Link from "next/link";
import { useState } from "react";
import { PieceList } from "@/components/PieceRow";
import { PlaceMap } from "@/components/PlaceMap";
import { useCaptured } from "@/components/useField";
import { setDemoPlace, useLocation } from "@/components/useLocation";
import { useStudio } from "@/components/useStudio";
import { ALL_PLACES, piecesAt, REGIONS, type RegionId } from "@/lib/content";
import { isInside } from "@/lib/geo";
import { fieldTally, howFar } from "@/lib/geofence";

export default function MapPage() {
  const { here, demoPlaceId } = useLocation();
  const captured = useCaptured();
  useStudio(); // pins update when creators publish
  const [regionId, setRegionId] = useState<RegionId>("near");
  const region = REGIONS[regionId];
  const [selected, setSelected] = useState(region.places[0].id);
  const [notify, setNotify] = useState(true);
  const place = region.places.find((p) => p.id === selected) ?? region.places[0];
  const ids = piecesAt(place.id).map((p) => p.id);
  const demoHere = region.places.some((p) => p.id === demoPlaceId);
  const showHere = regionId === "near" || demoHere;
  const inside = isInside(here, place);
  const distance = inside ? "You're here" : showHere ? howFar(here, place) : "On your trip";
  const field = fieldTally(piecesAt(place.id), captured);
  const allField = fieldTally(ALL_PLACES.flatMap((pl) => piecesAt(pl.id)), captured);
  const demoPlace = ALL_PLACES.find((p) => p.id === demoPlaceId);

  return (
    <div className="screen">
      <div>
        <div className="eyebrow">The Map</div>
        <h1 style={{ fontSize: 28, marginTop: 6 }}>Hear where you are</h1>
        <p className="sec-sub" style={{ maxWidth: "36ch" }}>Creators pin audio to places: a park, a beach, a trail, a zoo, an eco resort, a whole valley.</p>
      </div>
      <div style={{ position: "relative" }}>
        <PlaceMap region={region} regionKey={regionId} selected={place.id} onSelect={setSelected} here={showHere ? here : undefined} captured={captured} />
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
        {field.total > 0 && (
          <div className="field-row">
            <span><b>{field.captured} of {field.total}</b> on-site {field.total === 1 ? "piece" : "pieces"} captured here. {inside ? "You're here: play to capture." : "Go here to unlock."}</span>
            {!inside && <button className="demo-link" onClick={() => setDemoPlace(place.id)}>Demo: pretend I&apos;m here</button>}
          </div>
        )}
        <PieceList ids={ids} />
      </div>
      {demoPlace && (
        <div className="field-row demo-on">
          <span>Demo: you&apos;re standing in <b>{demoPlace.name}</b>.</span>
          <button className="demo-link" onClick={() => setDemoPlace(null)}>Back to my real location</button>
        </div>
      )}
      <div className="field">
        <div className="eyebrow">Go outside to listen</div>
        <h3>Your field collection: {allField.captured} of {allField.total}</h3>
        <p>Some pieces only play where they were recorded. Walk there, listen once, and they&apos;re yours to replay anywhere.</p>
        <div className="field-bar"><i style={{ width: `${allField.total ? (allField.captured / allField.total) * 100 : 0}%` }} /></div>
      </div>
      <div className="toggle-row">
        <div><b>Tell me when I&apos;m near something</b><p>Pieces pinned to where you&apos;re standing rise to the top of Home.</p></div>
        <button className="switch" role="switch" aria-checked={notify} aria-label="Nearby alerts" onClick={() => setNotify(!notify)} />
      </div>
      <Link href="/studio/upload" className="creator-link"><span>Recorded something at a place like this? Pin it for listeners.</span><b>Studio</b></Link>
      <div className="steps3">
        <div className="step3"><b>Explore by place</b><span>See what&apos;s been recorded near you, or somewhere you&apos;re travelling to.</span></div>
        <div className="step3"><b>Arrive and listen</b><span>Pieces pinned to where you&apos;re standing rise to the top of the app.</span></div>
      </div>
    </div>
  );
}
