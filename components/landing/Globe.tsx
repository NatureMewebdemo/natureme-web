"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import landTopo from "world-atlas/land-110m.json";

/** Sample places with stories waiting on them. All locked until the listener arrives. */
const PLACES = [
  { name: "Arashiyama, Kyoto", coords: [135.67, 35.01], title: "Walking the bamboo grove", meta: "Meditation · 12 min" },
  { name: "Hilo Bay, Hawaiʻi", coords: [-155.08, 19.73], title: "Where the rain begins", meta: "Story · 18 min" },
  { name: "Lofoten, Norway", coords: [13.6, 68.2], title: "Night of the midnight sun", meta: "Story · 22 min" },
  { name: "Wadi Rum, Jordan", coords: [35.42, 29.57], title: "Stars over the red desert", meta: "Meditation · 15 min" },
  { name: "Kakadu, Australia", coords: [132.4, -12.8], title: "Songs of the stone country", meta: "Audiobook · Chapter 1" },
  { name: "Torres del Paine, Patagonia", coords: [-73.0, -51.0], title: "Wind at the end of the world", meta: "Story · 20 min" },
  { name: "Kilimanjaro, Tanzania", coords: [37.35, -3.07], title: "The mountain that makes its weather", meta: "Podcast · 26 min" },
  { name: "Lake Louise, Banff", coords: [-116.18, 51.42], title: "First light on the lake", meta: "Meditation · 10 min" },
  { name: "Glencoe, Scotland", coords: [-5.0, 56.68], title: "The glen remembers", meta: "Story · 16 min" },
  { name: "Amazon, Brazil", coords: [-60.0, -3.1], title: "A morning in the canopy", meta: "Meditation · 14 min" },
  { name: "Olympic Peninsula, Washington", coords: [-123.9, 47.86], title: "Rain on the cedars", meta: "Audiobook · Chapter 3" },
  { name: "Annapurna, Nepal", coords: [83.82, 28.6], title: "Above the clouds", meta: "Course · Session 2" },
  { name: "Cape Floral Kingdom, South Africa", coords: [18.47, -34.36], title: "The kingdom of small flowers", meta: "Story · 11 min" },
] as const;

type Rotation = [number, number];

const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land);
const GRATICULE = geoGraticule10();
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/** Milliseconds since page load; only called from event handlers and the animation loop. */
const now = () => performance.now();
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
const clampLat = (y: number) => Math.min(80, Math.max(-80, y));

/** An interactive orthographic globe for the landing hero: drag to spin, scroll or pinch to zoom, lock pins on places. */
export function Globe() {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [rotation, setRotation] = useState<Rotation>([-PLACES[0].coords[0] + 40, -25]);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState(0);
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Mutable interaction state read by the animation loop.
  const rot = useRef<Rotation>(rotation);
  const idleUntil = useRef(0);
  const flight = useRef<{ from: Rotation; to: Rotation; start: number } | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Slow spin when nobody is touching it, plus the flight to a chosen pin.
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const f = flight.current;
      if (f) {
        const t = Math.min(1, (now - f.start) / 1100);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        rot.current = [f.from[0] + (f.to[0] - f.from[0]) * e, f.from[1] + (f.to[1] - f.from[1]) * e];
        setRotation(rot.current);
        if (t === 1) flight.current = null;
      } else if (!still && now > idleUntil.current) {
        rot.current = [rot.current[0] + dt * 0.004, rot.current[1]];
        setRotation(rot.current);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Wheel zoom needs a non-passive listener; at the zoom limits the page scrolls as normal.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      const z = zoomRef.current;
      const next = clampZoom(z * Math.exp(-e.deltaY * 0.0015));
      if (next === z) return;
      e.preventDefault();
      setZoom(next);
      idleUntil.current = performance.now() + 4000;
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  // Drag to rotate, two fingers to pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const dragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    flight.current = null;
    idleUntil.current = Number.POSITIVE_INFINITY;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const pos = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, pos);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      setZoom(clampZoom(pinch.current.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.dist)));
      return;
    }
    const dx = pos.x - prev.x;
    const dy = pos.y - prev.y;
    if (!dragging.current && Math.hypot(dx, dy) < 2) return;
    if (!dragging.current) {
      dragging.current = true;
      svgRef.current?.setPointerCapture(e.pointerId);
    }
    const k = 0.32 / zoom;
    rot.current = [rot.current[0] + dx * k, clampLat(rot.current[1] - dy * k)];
    setRotation(rot.current);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      setTimeout(() => (dragging.current = false), 0);
      // a mouse still over the globe keeps it still; touch resumes the spin after a pause
      if (e.pointerType !== "mouse") idleUntil.current = performance.now() + 4000;
    }
  };

  const choose = (i: number) => {
    if (dragging.current) return;
    setSelected(i);
    const [lon, lat] = PLACES[i].coords;
    const from = rot.current;
    // take the short way round
    let toLon = -lon;
    while (toLon - from[0] > 180) toLon -= 360;
    while (toLon - from[0] < -180) toLon += 360;
    flight.current = { from, to: [toLon, clampLat(-lat + 12)], start: now() };
    idleUntil.current = Math.max(idleUntil.current, now() + 6000);
    setZoom((z) => Math.max(z, 1.8));
  };

  const { w, h } = size;
  const radius = Math.min(w * 0.42, h * 0.36);
  const cx = w / 2;
  const cy = h * 0.42;

  const projection = useMemo(
    () => geoOrthographic().scale(radius * zoom).translate([cx, cy]).rotate([rotation[0], rotation[1]]).clipAngle(90).clipExtent([[-2, -2], [w + 2, h + 2]]).precision(0.5),
    [radius, zoom, cx, cy, rotation, w, h],
  );
  const path = geoPath(projection);
  const center: [number, number] = [-rotation[0], -rotation[1]];
  const place = PLACES[selected];

  return (
    <div ref={boxRef} className="ls-globe">
      <svg
        ref={svgRef}
        width={w}
        height={h}
        role="img"
        aria-label="A globe of places with stories waiting on them. Drag to spin, scroll to zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={(e) => e.pointerType === "mouse" && (idleUntil.current = Number.POSITIVE_INFINITY)}
        onPointerLeave={(e) => e.pointerType === "mouse" && pointers.current.size === 0 && (idleUntil.current = now() + 1500)}
      >
        <defs>
          <radialGradient id="ls-ocean" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#6B55D0" />
            <stop offset="0.6" stopColor="#3D2A8C" />
            <stop offset="1" stopColor="#24175C" />
          </radialGradient>
          <radialGradient id="ls-glow" r="50%">
            <stop offset="0.82" stopColor="#D4F76B" stopOpacity="0.28" />
            <stop offset="1" stopColor="#D4F76B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ls-shade" cx="35%" cy="30%" r="80%">
            <stop offset="0.5" stopColor="#1A1045" stopOpacity="0" />
            <stop offset="1" stopColor="#1A1045" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        {w > 0 && (
          <>
            <circle cx={cx} cy={cy} r={radius * zoom * 1.12} fill="url(#ls-glow)" opacity={Math.max(0, 1 - (zoom - 1) * 2)} />
            <circle cx={cx} cy={cy} r={radius * zoom} fill="url(#ls-ocean)" />
            <path d={path(GRATICULE) ?? ""} fill="none" stroke="#F5F3E9" strokeOpacity="0.12" strokeWidth="0.8" />
            <path d={path(LAND) ?? ""} fill="#D4F76B" stroke="#C3E65A" strokeWidth="0.6" />
            <circle cx={cx} cy={cy} r={radius * zoom} fill="url(#ls-shade)" pointerEvents="none" />
            {PLACES.map((p, i) => {
              if (geoDistance(p.coords as [number, number], center) > Math.PI / 2 - 0.05) return null;
              const xy = projection(p.coords as [number, number]);
              if (!xy) return null;
              const on = i === selected;
              return (
                <g
                  key={p.name}
                  className={`ls-pin${on ? " is-on" : ""}`}
                  transform={`translate(${xy[0]},${xy[1]})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.name}: ${p.title}. Locked until you arrive.`}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), choose(i))}
                >
                  {on && <circle className="ls-pin-pulse" r="15" />}
                  <circle r={on ? 15 : 12} className="ls-pin-dot" />
                  <g transform={`scale(${on ? 1.15 : 0.95})`}>
                    <rect x="-4.5" y="-1" width="9" height="7" rx="1.6" fill="currentColor" />
                    <path d="M-2.7 -1v-2.2a2.7 2.7 0 0 1 5.4 0V-1" fill="none" stroke="currentColor" strokeWidth="1.7" />
                  </g>
                </g>
              );
            })}
          </>
        )}
      </svg>

      <div className="ls-globe-zoom">
        <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => clampZoom(z * 1.4))}>+</button>
        <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => clampZoom(z / 1.4))}>−</button>
      </div>

      <div className="ls-waiting" aria-live="polite">
        <p className="ls-kicker">Locked · {place.name}</p>
        <p className="ls-waiting-title">{place.title}</p>
        <p className="ls-waiting-meta">{place.meta} · Unlocks on arrival</p>
      </div>
    </div>
  );
}
