import Image from "next/image";
import { Calendar, Globe, Lock, MapPin, Walk } from "@/components/icons";
import { Waitlist } from "@/components/landing/Waitlist";
import "./landing.css";

export const metadata = {
  title: "Go Outside · NatureMe",
  description: "Nature audio that only plays when you get there. Launching soon. Creators, join the waitlist.",
};

const HELPS = [
  { Icon: MapPin, title: "Find stories where you stand", body: "Open the map and hear what's pinned around you: local history, a guided sit, the next chapter of an audiobook." },
  { Icon: Walk, title: "Unlock them by arriving", body: "Press play at home and nothing happens. Walk there and it opens, then it's yours to replay anywhere." },
  { Icon: Calendar, title: "Get your 17 minutes a day", body: "Two hours a week outside is linked to better health and wellbeing. NatureMe finds the gaps in your day for a walk." },
  { Icon: Globe, title: "Hear every culture's view of nature", body: "Hawaiian, Nordic, Aboriginal and Bedouin storytellers, schools of thought and faiths, all on one map." },
];

/** The public launching-soon page: a full-screen forest video, "Go Outside", then what NatureMe does and the creator waitlist. */
export default function ComingSoonPage() {
  return (
    <div className="landing">
      <section className="ls-hero">
        <video className="ls-hero-video" src="/landing/go-outside.mp4" poster="/landing/go-outside-poster.jpg" autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
        <div className="ls-hero-shade" aria-hidden="true" />
        <header className="ls-top">
          <Image src="/logo-wordmark.png" alt="NatureMe" width={163} height={24} priority />
          <a href="#waitlist" className="ls-pill">Creator waitlist</a>
        </header>
        <div className="ls-hero-copy">
          <h1>Go Outside</h1>
          <p>Nature audio that only plays when you get there.</p>
        </div>
        <a href="#about" className="ls-soon">
          Launching soon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
        </a>
      </section>

      <section id="about" className="ls-wrap ls-statement">
        <p>NatureMe pins stories, meditations and audiobooks to real places, so the only way to hear them is to go outside.</p>
      </section>

      <section className="ls-wrap ls-arrive">
        <div className="ls-arrive-copy">
          <p className="ls-kicker">The home of nature audio</p>
          <h2>Some stories only play where they happened.</h2>
          <p>Stories, meditations and audiobooks pinned to real places. Press play and nothing happens. Walk there, and it opens.</p>
          <div className="ls-arrive-ctas">
            <a href="#waitlist" className="ls-submit">Join the creator waitlist</a>
            <a href="#waitlist" className="ls-ghost">I just want to listen</a>
          </div>
        </div>
        <div className="ls-story" aria-label="Example of a locked story">
          <div className="ls-story-map">
            <span className="ls-story-lock"><Lock size={14} />Locked</span>
          </div>
          <div className="ls-story-meta">
            <p className="ls-kicker">Audio story · 9 min</p>
            <p className="ls-story-title">Why the oaks here lean the way they do</p>
            <p className="ls-story-by">By a local naturalist</p>
          </div>
          <div className="ls-story-place">
            <div><span>Only playable at Lindenwood Park</span><span className="ls-story-dist">0.4 mi</span></div>
            <div className="ls-story-bar"><div /></div>
            <p>5 minute walk. Hear it once there and it&apos;s yours to replay anywhere.</p>
          </div>
        </div>
      </section>

      <section className="ls-wrap ls-helps">
        <h2>NatureMe helps you…</h2>
        <div className="ls-cards">
          {HELPS.map(({ Icon, title, body }) => (
            <article key={title} className="ls-help">
              <span className="ls-help-icon"><Icon size={26} /></span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="waitlist" className="ls-wrap ls-join">
        <div className="ls-join-copy">
          <h2>Give people a reason to go outside.</h2>
          <p>Publish any kind of audio, set your own price or make it free, and earn for every minute listened. Founding creators get early access before launch.</p>
        </div>
        <Waitlist />
      </section>

      <section className="ls-wrap ls-statement ls-closing">
        <p>Go outside and hear where you are.</p>
      </section>

      <footer className="ls-foot">
        <div className="ls-wrap">
          <span>© 2026 NatureMe</span>
          <span>The home of nature audio</span>
        </div>
      </footer>
    </div>
  );
}
