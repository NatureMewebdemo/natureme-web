"use client";

import Link from "next/link";
import type { Piece } from "@/lib/content";
import { pieceSeconds } from "@/lib/duration";
import { directionsUrl, fencedPlace, howFar, type Fence } from "@/lib/geofence";
import { chapterAt, chapterCount, chapterWord, daysToFinish, GOAL_CHOICES } from "@/lib/habit";
import { MapPin, Walk } from "./icons";
import { usePlayer } from "./Player";
import { setGoal, useHabit } from "./useHabit";
import { setDemoPlace, useLocation } from "./useLocation";

/** Shown instead of the controls for a geofenced piece the listener hasn't reached. */
export function GoThere({ piece: p }: { piece: Piece }) {
  const { here } = useLocation();
  const { openSheet } = usePlayer();
  const place = fencedPlace(p);
  if (!place) return null;
  return (
    <div className="fence-card">
      <span className="fence-ic"><MapPin /></span>
      <div>
        <b>Only playable at {place.name}</b>
        <p>This {p.format === "course" ? "course" : "piece"} was recorded for the place itself. Go there and it unlocks; hear it once and it&apos;s yours to replay anywhere.</p>
      </div>
      <div className="fence-actions">
        <a className="btn solid" href={directionsUrl(place)} target="_blank" rel="noreferrer"><Walk />Directions · {howFar(here, place)}</a>
        <Link className="btn line" href="/map" onClick={() => openSheet(false)}>See it on the map</Link>
      </div>
      <button className="demo-link" onClick={() => setDemoPlace(place.id)}>Demo: pretend I&apos;m at {place.name}</button>
    </div>
  );
}

export function FenceNote({ fence, piece: p }: { fence: Fence; piece: Piece }) {
  const place = fencedPlace(p);
  if (!place || fence === "open" || fence === "away") return null;
  return <p className="fence-note">{fence === "here" ? `You're at ${place.name}. Listening now captures this piece for good.` : `Captured at ${place.name}. Yours to replay anywhere.`}</p>;
}

/** Chapter progress and "make this a daily habit" for multi-chapter pieces. */
export function HabitPanel({ piece: p, position }: { piece: Piece; position: number }) {
  const habit = useHabit();
  const n = chapterCount(p);
  if (n < 2) return null;
  const goal = habit.goal?.pieceId === p.id ? habit.goal : null;
  const word = chapterWord(p);
  const at = chapterAt(p, position);
  const finished = position >= pieceSeconds(p) - 0.5;
  return (
    <div className="habit-panel">
      <div className="habit-top">
        <b>{finished ? `All ${n} ${chapterWord(p, true)} done` : `${word[0].toUpperCase()}${word.slice(1)} ${at + 1} of ${n}`}</b>
        {goal && <span className="mono note">Daily goal · {goal.perDay} a day</span>}
      </div>
      <div className="chapters">{Array.from({ length: n }, (_, i) => <i key={i} className={i < at || finished ? "done" : i === at ? "now" : ""} />)}</div>
      {!goal && !finished && (
        <>
          <p className="note">Make it a daily habit: finish a little every day and NatureMe keeps your streak.</p>
          <div className="chips">
            {GOAL_CHOICES.map((k) => (
              <button key={k} className="chip" onClick={() => setGoal(p.id, k)}>
                {k} {k === 1 ? word : chapterWord(p, true)} a day · {daysToFinish(p, position, k)} days
              </button>
            ))}
          </div>
        </>
      )}
      {goal && !finished && <p className="note">At this pace you finish in {daysToFinish(p, position, goal.perDay)} days. Your streak is on Home.</p>}
    </div>
  );
}
