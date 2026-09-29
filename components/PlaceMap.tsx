"use client";

import { AdvancedMarker, APIProvider, ColorScheme, Map } from "@vis.gl/react-google-maps";
import { piecesAt, type Place, type Region } from "@/lib/content";
import type { LatLng } from "@/lib/geo";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
// Advanced markers need a Map ID; DEMO_MAP_ID works for development.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

interface Props {
  region: Region;
  regionKey: string;
  selected: string;
  onSelect(id: string): void;
  here?: LatLng;
}

export function PlaceMap({ region, regionKey, selected, onSelect, here }: Props) {
  if (!API_KEY) {
    return (
      <div className="gmap">
        <div className="gmap-fallback">
          <p>
            The map needs a Google Maps API key. Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to <code>.env.local</code> and restart.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="gmap">
      <APIProvider apiKey={API_KEY}>
        <Map
          key={regionKey}
          mapId={MAP_ID}
          defaultCenter={{ lat: region.center[1], lng: region.center[0] }}
          defaultZoom={region.zoom}
          colorScheme={ColorScheme.DARK}
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: "100%", height: "100%" }}
        >
          {region.places.map((pl: Place) => (
            <AdvancedMarker key={pl.id} position={{ lat: pl.lat, lng: pl.lng }} onClick={() => onSelect(pl.id)} title={pl.name}>
              <span className={`gpin${selected === pl.id ? " on" : ""}`}>{piecesAt(pl.id).length}</span>
            </AdvancedMarker>
          ))}
          {here && (
            <AdvancedMarker position={here} title="You are here">
              <span className="gme" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
