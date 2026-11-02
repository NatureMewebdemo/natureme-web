import Image from "next/image";
import { Bricolage_Grotesque } from "next/font/google";
import { Globe as GlobeMap } from "@/components/landing/Globe";
import { Waitlist } from "@/components/landing/Waitlist";
import "./landing.css";

const grotesk = Bricolage_Grotesque({ variable: "--font-grotesk", weight: ["600", "700", "800"], subsets: ["latin"] });

export const metadata = {
  title: "Some stories only play where they happened · NatureMe",
  description: "Stories, meditations and audiobooks pinned to real places. Launching soon. Creators, join the waitlist.",
};

/** Bold flat shapes, one per card, in the brand palette. */
const SHAPES = {
  leaf: "M40 0H100V60A40 40 0 0 1 60 100H0V40A40 40 0 0 1 40 0Z",
  diamond: "M50 0L100 50L50 100L0 50Z",
  star: "M0 0Q50 34 100 0Q66 50 100 100Q50 66 0 100Q34 50 0 0Z",
  circle: "M50 0A50 50 0 1 1 49.99 0Z",
};

/** Small shapes scattered beside the closing line: [shape, color, left %, top %, size px, rotation deg]. */
const SCATTER: [string, string, number, number, number, number][] = [
  [SHAPES.leaf, "var(--ls-violet)", 6, 18, 34, -12],
  [SHAPES.star, "var(--ls-violet-soft)", 30, 2, 22, 8],
  [SHAPES.circle, "var(--ls-forest)", 52, 30, 16, 0],
  [SHAPES.diamond, "var(--ls-forest)", 78, 8, 28, 0],
  [SHAPES.circle, "var(--ls-violet)", 18, 62, 22, 0],
  [SHAPES.diamond, "var(--ls-violet-soft)", 40, 78, 18, 0],
  [SHAPES.star, "var(--ls-violet)", 66, 58, 30, -6],
  [SHAPES.leaf, "var(--ls-forest)", 90, 50, 20, 24],
  [SHAPES.star, "var(--ls-forest)", 4, 88, 16, 14],
];

/** A second, wider arrangement for under the creator copy. */
const SCATTER_WIDE: [string, string, number, number, number, number][] = [
  [SHAPES.diamond, "var(--ls-violet)", 2, 30, 24, 0],
  [SHAPES.circle, "var(--ls-forest)", 14, 70, 14, 0],
  [SHAPES.star, "var(--ls-violet-soft)", 24, 12, 26, -8],
  [SHAPES.leaf, "var(--ls-forest)", 38, 52, 22, 18],
  [SHAPES.circle, "var(--ls-violet)", 52, 16, 18, 0],
  [SHAPES.star, "var(--ls-violet)", 63, 60, 20, 10],
  [SHAPES.diamond, "var(--ls-violet-soft)", 76, 22, 16, 0],
  [SHAPES.leaf, "var(--ls-violet)", 88, 54, 30, -14],
];

/** A ring around the centred live-app copy: shapes sit on the sides and above and below, never over the text. */
const SCATTER_RING: [string, string, number, number, number, number][] = [
  [SHAPES.star, "var(--ls-violet)", 4, 10, 28, -10],
  [SHAPES.circle, "var(--ls-violet-soft)", 12, 46, 16, 0],
  [SHAPES.leaf, "var(--ls-forest)", 3, 78, 24, 20],
  [SHAPES.diamond, "var(--ls-violet-soft)", 30, 0, 16, 0],
  [SHAPES.circle, "var(--ls-forest)", 68, 2, 12, 0],
  [SHAPES.leaf, "var(--ls-violet)", 90, 8, 30, -18],
  [SHAPES.diamond, "var(--ls-forest)", 84, 50, 22, 0],
  [SHAPES.star, "var(--ls-violet-soft)", 94, 82, 20, 12],
  [SHAPES.circle, "var(--ls-violet)", 26, 96, 14, 0],
  [SHAPES.star, "var(--ls-forest)", 72, 95, 16, -6],
];

/** A light sprinkle for the hero: three to the right of the headline, three under the buttons. */
const SCATTER_HERO: [string, string, number, number, number, number][] = [
  [SHAPES.star, "var(--ls-violet)", 93, 6, 26, -8],
  [SHAPES.circle, "var(--ls-forest)", 97, 30, 12, 0],
  [SHAPES.diamond, "var(--ls-violet-soft)", 90, 48, 16, 0],
  [SHAPES.leaf, "var(--ls-violet)", 8, 88, 22, 16],
  [SHAPES.star, "var(--ls-violet-soft)", 30, 96, 16, 10],
  [SHAPES.circle, "var(--ls-violet)", 52, 86, 12, 0],
];

/** Small shapes placed by percentage inside a positioned box, each bobbing gently. */
function Scatter({ items, className }: { items: typeof SCATTER; className: string }) {
  return (
    <div className={`ls-scatter ${className}`} aria-hidden="true">
      {items.map(([shape, color, left, top, size, turn], i) => (
        <svg key={i} viewBox="0 0 100 100" style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, rotate: `${turn}deg`, animationDelay: `${-i * 0.7}s` }}>
          <path d={shape} fill={color} />
        </svg>
      ))}
    </div>
  );
}

const HELPS = [
  { shape: SHAPES.leaf, color: "var(--ls-lime)", title: "Find stories where you stand", body: "Open the map and hear what's pinned around you: local history, a guided sit, the next chapter of an audiobook." },
  { shape: SHAPES.diamond, color: "var(--ls-cream)", title: "Unlock them by arriving", body: "Press play at home and nothing happens. Walk there and it opens, then it's yours to replay anywhere." },
  { shape: SHAPES.star, color: "var(--ls-violet-soft)", title: "Get your 17 minutes a day", body: "Two hours a week outside is linked to better health and wellbeing. NatureMe finds the gaps in your day for a walk." },
  { shape: SHAPES.circle, color: "var(--ls-forest)", title: "Hear every culture's view of nature", body: "Hawaiian, Nordic, Aboriginal and Bedouin storytellers, schools of thought and faiths, all on one map." },
];

/** Screens from the live NatureMe meditation app, shown in phone frames. */
const APP_SCREENS = [
  { src: "/landing/app-explore.jpg", alt: "The Explore tab: illustrated playlists like Start Here, After the Intro, Sit Spot Course and Wander Course" },
  { src: "/landing/app-sharing-your-story.jpg", alt: "The Sharing Your Story course, with a Continue button and its sessions" },
  { src: "/landing/app-sit-spot.jpg", alt: "The Sit Spot Course: ten sessions, 95 minutes, from the Wilderness Awareness School" },
];

const APP_STORE_URL = "https://apps.apple.com/us/app/natureme-nature-meditation/id6746290732";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=eco.amphibian.natureme";

/** The public launching-soon page: lime ground, a spinning globe of locked stories, then what NatureMe does and the creator waitlist. */
export default function ComingSoonPage() {
  return (
    <div className={`landing ${grotesk.variable}`}>
      <header className="ls-top">
        <a href="#top" className="ls-brand" aria-label="NatureMe">
          <Image src="/logo-mark-on-violet.png" alt="" width={386} height={480} priority />
          <Image src="/logo-wordmark-on-violet.png" alt="NatureMe" width={815} height={120} priority />
        </a>
        <a href="#waitlist" className="ls-top-cta">Join the waitlist</a>
      </header>

      <section id="top" className="ls-hero">
        <div className="ls-hero-copy">
          <Scatter items={SCATTER_HERO} className="ls-scatter-hero" />
          <h1>Some stories only play <span className="ls-accent">where they happened.</span></h1>
          <p className="ls-lede">Stories, meditations and audiobooks pinned to real places. Press play and nothing happens. Walk there, and it opens.</p>
          <div className="ls-ctas">
            <a href="#waitlist" className="ls-btn">Join the creator waitlist</a>
            <a href="#waitlist" className="ls-btn ls-btn-ghost">I just want to listen</a>
          </div>
        </div>
        <figure className="ls-photo">
          <GlobeMap />
        </figure>
        <p className="ls-fresh">Made for fresh air, not your feed.</p>
      </section>

      <section className="ls-band">
        <div className="ls-wrap ls-helps">
          <h2>NatureMe helps you…</h2>
          <div className="ls-cards">
            {HELPS.map(({ shape, color, title, body }) => (
              <article key={title} className="ls-help">
                <svg className="ls-help-shape" viewBox="0 0 100 100" aria-hidden="true"><path d={shape} fill={color} /></svg>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="app" className="ls-wrap ls-app">
        <div className="ls-app-copy">
          <Scatter items={SCATTER_RING} className="ls-scatter-ring" />
          <h2>A little nature, right now.</h2>
          <p>Our first version is already live. Download NatureMe and enjoy nature meditations while we build the next chapter.</p>
          <div className="ls-ctas">
            <a href={APP_STORE_URL} className="ls-btn" target="_blank" rel="noopener">App Store</a>
            <a href={GOOGLE_PLAY_URL} className="ls-btn" target="_blank" rel="noopener">Google Play</a>
          </div>
        </div>
        <div className="ls-phones">
          {APP_SCREENS.map(({ src, alt }) => (
            <div key={src} className="ls-phone">
              <span className="ls-phone-island" aria-hidden="true" />
              <Image src={src} alt={alt} width={780} height={1691} sizes="(max-width: 760px) 70vw, 300px" />
            </div>
          ))}
        </div>
      </section>

      <section id="waitlist" className="ls-wrap ls-join">
        <div className="ls-join-copy">
          <h2>Give people a reason to go outside.</h2>
          <p>Publish any kind of audio, set your own price or make it free, and earn for every minute listened. Founding creators get early access before launch.</p>
          <Scatter items={SCATTER_WIDE} className="ls-scatter-under" />
        </div>
        <Waitlist />
      </section>

      <section className="ls-wrap ls-closing">
        <p>Go outside and hear where you are.</p>
        <Scatter items={SCATTER} className="ls-scatter-side" />
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
