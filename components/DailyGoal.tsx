"use client";

import { useState } from "react";
import { findPiece, FORMATS } from "@/lib/content";
import { pieceSeconds } from "@/lib/duration";
import { chapterAt, chapterCount, chapterWord, dayKey, daysToFinish, GOAL_CHOICES, HABIT_SUGGESTIONS, reminderIcs, streak, week } from "@/lib/habit";
import { Calendar, Play } from "./icons";
import { usePlayer } from "./Player";
import { clearGoal, setGoal, setReminder, useHabit } from "./useHabit";

function downloadReminder(time: string, title: string) {
  const ics = reminderIcs({ time, title, url: location.origin, now: new Date() });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "natureme-daily-reminder.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Home card for the daily listening goal: set one, or see today's chapter and the streak. */
export function DailyGoal() {
  const habit = useHabit();
  const { nowId, play, openSheet } = usePlayer();
  const goal = habit.goal;
  const p = goal ? findPiece(goal.pieceId) : undefined;
  if (!goal || !p) return <PickGoal />;

  const today = new Date();
  const position = habit.progress[p.id] ?? 0;
  const n = chapterCount(p);
  const finished = position >= pieceSeconds(p) - 0.5;
  const doneToday = habit.days[dayKey(today)]?.chapters ?? 0;
  const days = streak(habit.days, goal.perDay, today);
  const word = chapterWord(p);
  const open = () => (nowId === p.id ? openSheet(true) : play(p.id));

  return (
    <section className="habit">
      <div className="habit-head">
        <div className="eyebrow">Daily habit</div>
        <span className="streak mono">{days} day{days === 1 ? "" : "s"} in a row</span>
      </div>
      {finished ? (
        <>
          <h3>You finished {p.title}.</h3>
          <p className="habit-sub">{n} {chapterWord(p, true)}, a little every day. Pick what&apos;s next and keep the streak going.</p>
          <div className="gap-actions"><button className="btn solid" onClick={clearGoal}>Pick what&apos;s next</button></div>
        </>
      ) : (
        <>
          <h3>Today: {word} {chapterAt(p, position) + 1} of {n}</h3>
          <p className="habit-sub">{p.title} · {FORMATS[p.format].short}</p>
          <div className="today-goal">
            <b className="mono">{Math.min(doneToday, goal.perDay)}/{goal.perDay}</b>
            <span>{doneToday >= goal.perDay ? "Today's goal done. See you tomorrow." : `${goal.perDay - doneToday} ${goal.perDay - doneToday === 1 ? word : chapterWord(p, true)} to go today · done in ${daysToFinish(p, position, goal.perDay)} days at this pace`}</span>
          </div>
          <div className="week" aria-label="This week">
            {week(habit.days, goal.perDay, today).map((d) => (
              <span key={d.key} className={`${d.met ? "met" : ""}${d.today ? " today" : ""}`}><i />{d.label}</span>
            ))}
          </div>
          <div className="gap-actions">
            <button className="btn solid" onClick={open}><Play />{position > 0 ? "Continue" : "Start"} {word} {chapterAt(p, position) + 1}</button>
            <button className="btn line" onClick={clearGoal}>Change goal</button>
          </div>
        </>
      )}
      <div className="reminder">
        <label>
          <span>Remind me every day at</span>
          <input type="time" className="input" value={goal.reminder} onChange={(e) => e.target.value && setReminder(e.target.value)} />
        </label>
        <button className="btn line" onClick={() => downloadReminder(goal.reminder, finished ? "NatureMe: time to listen" : `NatureMe: today's ${word} of ${p.title}`)}>
          <Calendar size={16} />Add to my calendar
        </button>
      </div>
    </section>
  );
}

function PickGoal() {
  const habit = useHabit();
  const { play } = usePlayer();
  // Long pieces already started come first, then editor suggestions.
  const started = Object.keys(habit.progress).filter((id) => {
    const p = findPiece(id);
    return p && chapterCount(p) > 1 && habit.progress[id] < pieceSeconds(p) - 0.5;
  });
  const options = [...new Set([...started, ...HABIT_SUGGESTIONS])].filter((id) => findPiece(id)).slice(0, 4);
  const [pick, setPick] = useState<string | null>(null);
  const [perDay, setPerDay] = useState(1);
  const chosen = findPiece(pick ?? options[0]);
  if (!chosen) return null;
  const word = chapterWord(chosen);
  return (
    <section className="habit">
      <div className="eyebrow">Daily habit</div>
      <h3>Finish something long, a little every day.</h3>
      <p className="habit-sub">Pick a book or a course and a daily goal. NatureMe keeps your streak and reminds you to come back.</p>
      <div className="chips" role="group" aria-label="What to finish">
        {options.map((id) => {
          const p = findPiece(id)!;
          return (
            <button key={id} className="chip" aria-pressed={chosen.id === id} onClick={() => setPick(id)}>
              {p.title} <span className="mono note">{chapterCount(p)} {chapterWord(p, true)}</span>
            </button>
          );
        })}
      </div>
      <div className="chips" role="group" aria-label="Daily goal">
        {GOAL_CHOICES.map((k) => (
          <button key={k} className="chip" aria-pressed={perDay === k} onClick={() => setPerDay(k)}>
            {k} {k === 1 ? word : chapterWord(chosen, true)} a day
          </button>
        ))}
      </div>
      <p className="note">Done in {daysToFinish(chosen, habit.progress[chosen.id] ?? 0, perDay)} days.</p>
      <div className="gap-actions">
        <button className="btn solid" onClick={() => { setGoal(chosen.id, perDay); play(chosen.id); }}><Play />Start today&apos;s {word}</button>
      </div>
    </section>
  );
}
