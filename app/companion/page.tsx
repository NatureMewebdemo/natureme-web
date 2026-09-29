"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Leaf, Pause, Play } from "@/components/icons";
import { PieceList } from "@/components/PieceRow";
import { usePlayer } from "@/components/Player";
import { useLocation } from "@/components/useLocation";
import { timeRange, useOuting } from "@/components/useOuting";
import { sampleCalendar } from "@/lib/calendar";
import type { CalendarEvent } from "@/lib/companion";
import { FORMATS, piecesAt } from "@/lib/content";
import { clock, lengthSeconds } from "@/lib/duration";

const STEPS = ["A gap appears", "You arrive", "A story of the place", "A short sit", "Back to work"];
const NEXT = ["I'm going", "Play the story", "Next: a short sit", "Finish the walk"];
const DAY_START = 13; // the calendar strip shows 1 PM to 5 PM
const PX_PER_MIN = 34 / 30;

function CalendarStrip({ events, gap }: { events: CalendarEvent[]; gap?: { start: Date; end: Date; label: string } }) {
  const top = (d: Date) => ((d.getHours() - DAY_START) * 60 + d.getMinutes()) * PX_PER_MIN + 2;
  const height = (a: Date, b: Date) => ((b.getTime() - a.getTime()) / 60_000) * PX_PER_MIN - 6;
  const hours = ["1 PM", "1:30", "2 PM", "2:30", "3 PM", "3:30", "4 PM", "4:30", "5 PM"];
  return (
    <div className="cal">
      {hours.map((h, i) => <div key={h} className="hr" style={{ gridRow: i + 1 }}>{h}</div>)}
      <div className="col">
        {events.map((e) => (
          <div key={e.title} className="ev" style={{ top: top(e.start), height: height(e.start, e.end) }}>
            {e.title}<small>{timeRange(e.start, e.end)}</small>
          </div>
        ))}
        {gap && (
          <div className="ev gapev" style={{ top: top(gap.start), height: height(gap.start, gap.end) }}>
            <b>{gap.label}</b><small>{timeRange(gap.start, gap.end)} · suggested by NatureMe</small>
          </div>
        )}
      </div>
    </div>
  );
}

function SitTimer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => (l <= 10 ? (setRunning(false), 0) : l - 10)), 1000);
    return () => clearInterval(t);
  }, [running]);
  const C = 2 * Math.PI * 78;
  return (
    <div className="timer">
      <svg className="ring" viewBox="0 0 168 168">
        <circle className="bg" cx="84" cy="84" r="78" />
        <circle className="fg" cx="84" cy="84" r="78" strokeDasharray={C} strokeDashoffset={C * (1 - left / seconds)} transform="rotate(-90 84 84)" />
      </svg>
      <div className="num">{clock(left)}</div>
      <button className="btn line" onClick={() => { if (!left) setLeft(seconds); setRunning(!running); }}>
        {running ? <><Pause />Pause sit</> : <><Play />Start sit</>}
      </button>
      <span className="note">Demo speed: one second counts as ten.</span>
    </div>
  );
}

export default function CompanionPage() {
  const { here } = useLocation();
  const outing = useOuting(here);
  const { play, nowId, playing } = usePlayer();
  const [step, setStep] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const from = new Date(); from.setHours(DAY_START, 0, 0, 0);
    const to = new Date(from); to.setHours(17);
    sampleCalendar.busy(from, to).then(setEvents);
  }, []);

  if (!outing) {
    return (
      <div className="screen">
        <div><div className="eyebrow">Companion</div><h1 style={{ fontSize: 28, marginTop: 6 }}>No gaps today</h1>
          <p className="sec-sub">When a free stretch opens up near a pinned place, it shows up here.</p></div>
      </div>
    );
  }

  const place = outing.place;
  const pinned = piecesAt(place.id);
  const story = pinned.find((p) => p.format === "story") ?? pinned[0];
  const sit = pinned.find((p) => p.format === "meditation");
  const credited = [story, sit].filter(Boolean).map((p) => ({ p: p!, minutes: Math.round(lengthSeconds(p!.length) / 60) }));
  const maxMin = Math.max(...credited.map((c) => c.minutes));

  const next = () => {
    if (step === 1 && (nowId !== story.id || !playing)) play(story.id);
    setStep(Math.min(4, step + 1));
  };

  return (
    <div className="screen">
      <div>
        <Link href="/profile" className="back-link">‹ Profile</Link>
        <div className="eyebrow" style={{ marginTop: 10 }}>Companion</div>
        <h1 style={{ fontSize: 28, marginTop: 6 }}>Your calendar, with a way outside</h1>
        <p className="sec-sub">Sample calendar · Google Calendar connects next</p>
      </div>
      <div className="stepper" aria-label={`Step ${step + 1} of 5`}>{STEPS.map((s, i) => <span key={s} className={i <= step ? "on" : ""} />)}</div>
      <div className="stage">
        <div className="eyebrow">Step {step + 1} · {STEPS[step]}</div>
        {step === 0 && (
          <>
            <h2>The companion sees {outing.gap.minutes} free minutes in your calendar and a park {outing.walkMinutes} minutes away.</h2>
            <CalendarStrip events={events} gap={{ ...outing.gap, label: `${outing.gap.minutes} min free · ${place.name}, ${outing.walkMinutes} min` }} />
            <div className="notif">
              <span className="ic"><Leaf /></span>
              <div><b>{outing.gap.minutes} minutes before your next meeting</b>
                <p>{place.name} is a {outing.walkMinutes}-minute walk. {pinned.length} pieces are pinned there.</p></div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2>{pinned.length} pieces pinned to this park appear at the top of your home screen.</h2>
            <div className="near"><div className="near-head"><span className="pulse" />You&apos;re in {place.name}</div><PieceList ids={pinned.map((p) => p.id)} className="rise" /></div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>{story.by.replace(/^By /, "")} tells you the story of this place.</h2>
            <PieceList ids={[story.id]} />
            <p className="quote">&ldquo;Look at the three oaks nearest the water. Each one leans east. That isn&apos;t the wind. It&apos;s the light, and a hundred years of reaching for it across the creek.&rdquo;</p>
            <p className="note">Transcript excerpt, sample content.</p>
          </>
        )}
        {step === 3 && sit && (
          <>
            <h2>An {Math.round(lengthSeconds(sit.length) / 60)}-minute {FORMATS[sit.format].name.toLowerCase()} by the stream, from the Zen section.</h2>
            <PieceList ids={[sit.id]} />
            <SitTimer seconds={lengthSeconds(sit.length)} />
          </>
        )}
        {step === 4 && (
          <>
            <h2>{outing.minutesThere} minutes outdoors logged.</h2>
            <div className="log">
              <div><b>{outing.minutesThere}</b><span>min outdoors</span></div>
              <div><b>{credited.length}</b><span>pieces heard</span></div>
              <div><b>{credited.reduce((a, c) => a + c.minutes, 0)}</b><span>min listened</span></div>
            </div>
            <div className="earn">
              <div className="eyebrow">The creators earn from every minute you listened</div>
              {credited.map(({ p, minutes }) => (
                <div key={p.id} className="earn-row" style={{ ["--c" as string]: `var(${FORMATS[p.format].color})` }}>
                  <span><b>{p.by.replace(/^By /, "")}</b> · {p.title}</span><span className="mono">{minutes} min</span>
                  <div className="bar"><i style={{ width: `${(minutes / maxMin) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="notif">
              <span className="ic"><Calendar /></span>
              <div><b>Next meeting at {outing.gap.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</b>
                <p>You&apos;re a {outing.walkMinutes}-minute walk from your desk. Head back now.</p></div>
            </div>
          </>
        )}
        <div className="stage-nav">
          {step > 0 ? <button className="btn line" onClick={() => setStep(step - 1)}>Back</button> : <span />}
          {step < 4
            ? <button className="btn solid" onClick={next}>{NEXT[step]}</button>
            : <button className="btn solid" onClick={() => setStep(0)}>Replay the flow</button>}
        </div>
      </div>
    </div>
  );
}
