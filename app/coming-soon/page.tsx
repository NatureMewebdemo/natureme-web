import Image from "next/image";
import { Bricolage_Grotesque } from "next/font/google";
import { Calendar, Globe, MapPin, Walk } from "@/components/icons";
import { Waitlist } from "@/components/landing/Waitlist";
import "./landing.css";

const grotesk = Bricolage_Grotesque({ variable: "--font-grotesk", weight: ["600", "700", "800"], subsets: ["latin"] });

export const metadata = {
  title: "Some stories only play where they happened · NatureMe",
  description: "Stories, meditations and audiobooks pinned to real places. Launching soon. Creators, join the waitlist.",
};

const HELPS = [
  { Icon: MapPin, title: "Find stories where you stand", body: "Open the map and hear what's pinned around you: local history, a guided sit, the next chapter of an audiobook." },
  { Icon: Walk, title: "Unlock them by arriving", body: "Press play at home and nothing happens. Walk there and it opens, then it's yours to replay anywhere." },
  { Icon: Calendar, title: "Get your 17 minutes a day", body: "Two hours a week outside is linked to better health and wellbeing. NatureMe finds the gaps in your day for a walk." },
  { Icon: Globe, title: "Hear every culture's view of nature", body: "Hawaiian, Nordic, Aboriginal and Bedouin storytellers, schools of thought and faiths, all on one map." },
];

/** Screens from the live NatureMe meditation app, shown in phone frames. */
const APP_SCREENS = [
  { src: "/landing/app-explore.jpg", alt: "The Explore tab: illustrated playlists like Start Here, Sit Spot Course and Wander Course" },
  { src: "/landing/app-sharing-your-story.jpg", alt: "The Sharing Your Story course, with a Continue button and its sessions" },
  { src: "/landing/app-sit-spot.jpg", alt: "The Sit Spot Course, two of ten sessions done" },
];

// TODO: the store listings of the live app.
const APP_STORE_URL = "#app";
const GOOGLE_PLAY_URL = "#app";

/** The public launching-soon page: lime ground, a forest river photo with a story waiting on it, then what NatureMe does and the creator waitlist. */
export default function ComingSoonPage() {
  return (
    <div className={`landing ${grotesk.variable}`}>
      <section className="ls-hero">
        <header className="ls-top">
          <Image src="/logo-vertical-light.png" alt="NatureMe" width={78} height={63} priority />
          <p className="ls-tagline">Less scrolling. More wandering.</p>
        </header>
        <div className="ls-hero-copy">
          <p className="ls-kicker">Good things are waiting outside</p>
          <h1>Some stories only play where they happened.</h1>
          <p className="ls-lede">Stories, meditations and audiobooks pinned to real places. Press play and nothing happens. Walk there, and it opens.</p>
          <div className="ls-ctas">
            <a href="#waitlist" className="ls-btn">Join the creator waitlist</a>
            <a href="#waitlist" className="ls-btn ls-btn-ghost">I just want to listen</a>
          </div>
        </div>
        <figure className="ls-photo">
          <Image src="/landing/forest-river.jpg" alt="A river winding through pine forest and bright green meadows" fill sizes="(max-width: 860px) 100vw, 45vw" priority />
          <figcaption className="ls-waiting">
            <p className="ls-kicker">Waiting at the river bend</p>
            <p className="ls-waiting-title">A slower kind of morning</p>
            <p className="ls-waiting-meta">Meditation · 12 min · Unlocks on arrival</p>
          </figcaption>
        </figure>
        <p className="ls-fresh">Made for fresh air, not your feed.</p>
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

      <section id="app" className="ls-wrap ls-app">
        <div className="ls-app-copy">
          <h2>A little nature, right now.</h2>
          <p>Our first version is already live. Download NatureMe and enjoy nature meditations while we build the next chapter.</p>
          <div className="ls-ctas">
            <a href={APP_STORE_URL} className="ls-btn">App Store</a>
            <a href={GOOGLE_PLAY_URL} className="ls-btn">Google Play</a>
          </div>
        </div>
        <div className="ls-phones">
          {APP_SCREENS.map(({ src, alt }) => (
            <div key={src} className="ls-phone">
              <span className="ls-phone-island" aria-hidden="true" />
              <Image src={src} alt={alt} width={590} height={1279} sizes="(max-width: 760px) 70vw, 300px" />
            </div>
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

      <section className="ls-wrap ls-closing">
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
