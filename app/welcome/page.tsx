"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, Globe, Lotus, MapPin, Star } from "@/components/icons";
import { FORMATS, WAYS, type FormatId, type WayId } from "@/lib/content";
import { savePreferences, type Preferences } from "@/lib/preferences";

const WAY_ICONS: Record<WayId, typeof Lotus> = { schools: Lotus, cultures: Globe, faiths: Star };
const STEPS = 5;

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [traditions, setTraditions] = useState<string[]>([]);
  const [formats, setFormats] = useState<FormatId[]>([]);
  const [location, setLocation] = useState<Preferences["location"]>("skipped");
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState("");

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const finish = (calendar: Preferences["calendar"], overrides: Partial<Preferences> = {}) => {
    savePreferences({ name: name.trim() || undefined, traditions, formats, location, calendar, completedAt: new Date().toISOString(), ...overrides });
    router.replace("/");
  };

  const askLocation = () => {
    if (!("geolocation" in navigator)) return setStep(4);
    setAsking(true);
    navigator.geolocation.getCurrentPosition(
      () => { setLocation("allowed"); setAsking(false); setStep(4); },
      () => { setAsking(false); setStep(4); },
      { timeout: 10_000 },
    );
  };

  return (
    <div className="screen onb">
      {step > 0 && (
        <div className="onb-top">
          <button className="onb-back" onClick={() => setStep(step - 1)}>Back</button>
          <div className="stepper" aria-label={`Step ${step} of ${STEPS - 1}`}>
            {Array.from({ length: STEPS - 1 }, (_, i) => <span key={i} className={i < step ? "on" : ""} />)}
          </div>
        </div>
      )}

      {step === 0 && (
        <div className="onb-hero">
          <Image src="/logo-vertical-dark.png" alt="NatureMe" width={200} height={275} priority />
          <h1>The home of nature audio</h1>
          <p>Stories, courses, audiobooks, podcasts and meditations, pinned to the places you walk.</p>
          <input className="field" placeholder="What should we call you?" aria-label="Your name" autoComplete="given-name" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          <div className="onb-actions">
            <button className="btn solid onb-cta" onClick={() => setStep(1)}>Get started</button>
            <button className="onb-skip" onClick={() => finish("sample")}>Skip for now</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="onb-head">
            <div className="eyebrow">Three ways of seeing nature</div>
            <h1>What draws you outside?</h1>
            <p>Pick any that speak to you. We&apos;ll put them first on your Home.</p>
          </div>
          {(Object.keys(WAYS) as WayId[]).map((k) => {
            const w = WAYS[k], Icon = WAY_ICONS[k];
            return (
              <section key={k} className="onb-group">
                <h2><Icon size={18} />{w.label}</h2>
                <div className="chips">
                  {w.traditions.map((t) => (
                    <button key={t.id} className="chip onb-chip" aria-pressed={traditions.includes(t.id)} onClick={() => setTraditions(toggle(traditions, t.id))}>
                      <b>{t.name}</b><span>{t.line}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
          <div className="onb-foot">
            <button className="btn solid onb-cta" onClick={() => setStep(2)}>{traditions.length ? `Continue with ${traditions.length}` : "Skip this step"}</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="onb-head">
            <div className="eyebrow">Formats</div>
            <h1>How do you like to listen?</h1>
            <p>Choose as many as you like. You can still find everything in Explore.</p>
          </div>
          <div className="fmt-grid">
            {(Object.keys(FORMATS) as FormatId[]).map((k) => (
              <button key={k} className="fmt-card onb-fmt" aria-pressed={formats.includes(k)} onClick={() => setFormats(toggle(formats, k))} style={{ ["--c" as string]: `var(${FORMATS[k].color})` }}>
                <b>{FORMATS[k].plural}</b><span>{FORMATS[k].description}</span>
              </button>
            ))}
          </div>
          <div className="onb-foot">
            <button className="btn solid onb-cta" onClick={() => setStep(3)}>{formats.length ? "Continue" : "Skip this step"}</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="onb-head">
            <div className="onb-icon"><MapPin size={28} /></div>
            <div className="eyebrow">The Map</div>
            <h1>Hear where you are</h1>
            <p>Creators pin audio to parks, beaches, trails and whole valleys. With your location, pieces pinned where you&apos;re standing rise to the top of Home.</p>
          </div>
          <ul className="onb-list">
            <li>Used only to find pieces near you</li>
            <li>Never shared with creators</li>
            <li>You can turn it off in your browser at any time</li>
          </ul>
          <div className="onb-foot">
            <button className="btn solid onb-cta" onClick={askLocation} disabled={asking}>{asking ? "Waiting for your browser…" : "Allow location"}</button>
            <button className="onb-skip" onClick={() => setStep(4)}>Not now</button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <div className="onb-head">
            <div className="onb-icon"><Calendar size={28} /></div>
            <div className="eyebrow">Companion</div>
            <h1>Find time outside</h1>
            <p>The Companion spots a gap in your day and a place nearby worth hearing. When 40 minutes open up and a park is 6 minutes away, it lets you know.</p>
          </div>
          <div className="onb-gap" aria-hidden>
            <span style={{ flex: 3 }}>Meeting</span><span className="free" style={{ flex: 2 }}>40 min free</span><span style={{ flex: 2 }}>Meeting</span>
          </div>
          <ul className="onb-list">
            <li>Reads only when you&apos;re free or busy, never event details</li>
            <li>Google Calendar is coming soon; try it now with a sample day</li>
          </ul>
          <div className="onb-foot">
            <button className="btn solid onb-cta" onClick={() => finish("sample")}>Try with a sample calendar</button>
            <button className="onb-skip" onClick={() => finish("skipped")}>Skip</button>
          </div>
        </>
      )}
    </div>
  );
}
