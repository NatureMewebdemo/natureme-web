"use client";

import { useEffect, useRef } from "react";
import { FORMATS, type Piece } from "@/lib/content";

function rng(str: string) {
  let h = 2166136261;
  for (const ch of str) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

/** Contour-line artwork seeded by the title, until creators upload their own. */
function paint(cv: HTMLCanvasElement, seedText: string, colorVar: string) {
  const r = rng(seedText);
  const w = (cv.width = (cv.clientWidth || 56) * 2);
  const h = (cv.height = (cv.clientHeight || 56) * 2);
  const x = cv.getContext("2d");
  if (!x) return;
  x.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim() || "#75A07D";
  x.fillRect(0, 0, w, h);
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "rgba(255,255,255,.12)");
  g.addColorStop(1, "rgba(0,0,0,.28)");
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  const cx = w * (0.2 + r() * 0.6), cy = h * (0.2 + r() * 0.6);
  const n = 7 + Math.floor(r() * 6), k = 2 + Math.floor(r() * 3), ph = r() * 6;
  x.strokeStyle = "rgba(255,255,255,.35)";
  x.lineWidth = Math.max(1, w / 140);
  for (let i = 1; i <= n; i++) {
    x.beginPath();
    const R = i * (Math.max(w, h) / n) * 0.75;
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
      const rr = R * (1 + 0.12 * Math.sin(a * k + ph + i * 0.4));
      const px = cx + rr * Math.cos(a), py = cy + rr * 0.8 * Math.sin(a);
      if (a) x.lineTo(px, py);
      else x.moveTo(px, py);
    }
    x.stroke();
  }
}

export function Cover({ piece, className = "cover", children }: { piece: Piece; className?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const color = FORMATS[piece.format].color;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const draw = () => paint(cv, piece.title, color);
    draw();
  }, [piece.title, color]);
  return (
    <div className={className} style={{ ["--c" as string]: `var(${color})` }}>
      <canvas ref={ref} />
      {children}
    </div>
  );
}
