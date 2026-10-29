import Image from "next/image";
import { Waitlist } from "@/components/landing/Waitlist";
import "./landing.css";

export const metadata = {
  title: "Go Outside · NatureMe",
  description: "Nature audio that only plays when you get there. Coming soon. Creators, join the waitlist.",
};

/** The public coming-soon page: a full-screen landscape, "Go Outside", then the creator waitlist. */
export default function ComingSoonPage() {
  return (
    <div className="landing">
      <section className="ls-hero">
        <Image src="/landing/go-outside.jpg" alt="Waves breaking on a sandy beach, seen from above" fill priority sizes="100vw" className="ls-hero-img" />
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
          Coming soon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
        </a>
      </section>

      <section id="about" className="ls-wrap ls-three">
        <div>
          <h2>Stories pinned to places</h2>
          <p>Meditations, audiobooks, podcasts and local history, each tied to the beach, trail or valley it belongs to.</p>
        </div>
        <div>
          <h2>Unlocked on arrival</h2>
          <p>Press play at home and nothing happens. Walk there and it opens. Then it&apos;s yours to replay anywhere.</p>
        </div>
        <div>
          <h2>17 minutes a day</h2>
          <p>Two hours a week outside is linked to better health and wellbeing. We&apos;re here to get you those minutes.</p>
        </div>
      </section>

      <section id="waitlist" className="ls-wrap ls-join">
        <div className="ls-join-copy">
          <p className="ls-eyebrow">For creators</p>
          <h2>Give people a reason to go outside.</h2>
          <p>Publish any kind of audio, set your own price or make it free, and earn for every minute listened. Founding creators get early access before launch.</p>
        </div>
        <Waitlist />
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
