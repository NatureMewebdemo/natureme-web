"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Chevron, MapPin, User } from "@/components/icons";
import { usePlayer } from "@/components/Player";
import { useLocation } from "@/components/useLocation";
import { timeRange, useOuting } from "@/components/useOuting";
import { usePreferences } from "@/components/usePreferences";
import { FORMATS, WAYS, type WayId } from "@/lib/content";
import { clearPreferences, savePreferences } from "@/lib/preferences";

const TRADITIONS = new Map(
  (Object.keys(WAYS) as WayId[]).flatMap((w) => WAYS[w].traditions).map((t) => [t.id, t.name]),
);

export default function ProfilePage() {
  const router = useRouter();
  const prefs = usePreferences();
  const { listened } = usePlayer();
  const { here, isSample } = useLocation();
  const outing = useOuting(here);
  const companionOn = prefs?.calendar !== "skipped";

  const restart = () => {
    clearPreferences();
    router.push("/welcome");
  };
  const setCompanion = (on: boolean) => {
    if (prefs) savePreferences({ ...prefs, calendar: on ? "sample" : "skipped" });
  };

  return (
    <div className="screen">
      <div className="profile-head">
        <span className="avatar"><User size={30} /></span>
        <div>
          <h1>Your profile</h1>
          <p className="sec-sub">Listening on this device. Accounts come later.</p>
        </div>
      </div>

      <div className="log">
        <div><b className="mono">{Math.round(listened / 60)}</b><span>min listened</span></div>
        <div><b className="mono">{prefs?.traditions.length ?? 0}</b><span>traditions</span></div>
        <div><b className="mono">{prefs?.formats.length ?? 0}</b><span>formats</span></div>
      </div>

      <section className="profile-card">
        <div className="profile-card-head">
          <span className="profile-ic"><Calendar size={20} /></span>
          <div>
            <h2>Companion</h2>
            <p className="sec-sub">{companionOn ? "Using a sample calendar" : "Off"}</p>
          </div>
          <button className="switch" role="switch" aria-checked={companionOn} aria-label="Companion" onClick={() => setCompanion(!companionOn)} disabled={!prefs} />
        </div>
        {companionOn && outing && (
          <Link href="/companion" className="profile-row">
            <span>
              <b>{outing.gap.minutes} free minutes, {timeRange(outing.gap.start, outing.gap.end)}</b>
              <span className="sec-sub">{outing.place.name} is {outing.walkMinutes} minutes away</span>
            </span>
            <Chevron />
          </Link>
        )}
        {companionOn && (
          <Link href="/companion" className="btn solid" style={{ justifyContent: "center" }}>Open the Companion</Link>
        )}
        {!companionOn && <p className="note">Turn it on to get a nudge when a gap in your day lines up with a place worth hearing.</p>}
      </section>

      <section className="profile-card">
        <div className="sec-head">
          <h2>Your interests</h2>
          <button className="link" onClick={restart}>Change</button>
        </div>
        {prefs && (prefs.traditions.length || prefs.formats.length) ? (
          <div className="chips">
            {prefs.traditions.map((t) => <span key={t} className="chip">{TRADITIONS.get(t) ?? t}</span>)}
            {prefs.formats.map((f) => (
              <span key={f} className="chip" style={{ ["--c" as string]: `var(${FORMATS[f].color})` }}><i />{FORMATS[f].plural}</span>
            ))}
          </div>
        ) : (
          <p className="note">You haven&apos;t picked any yet. Choose traditions and formats to get a For you list on Home.</p>
        )}
      </section>

      <section className="profile-card">
        <div className="profile-card-head">
          <span className="profile-ic"><MapPin size={20} /></span>
          <div>
            <h2>Location</h2>
            <p className="sec-sub">{isSample ? "Using the sample area" : "Using your location"}</p>
          </div>
        </div>
        <p className="note">Pieces pinned where you&apos;re standing rise to the top of Home. Location is only used to find pieces near you.</p>
      </section>

      <button className="onb-skip" onClick={restart}>Start onboarding again</button>
    </div>
  );
}
