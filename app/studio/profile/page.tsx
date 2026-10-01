"use client";

import { useState } from "react";
import { saveProfile, useStudio } from "@/components/useStudio";
import type { CreatorProfile } from "@/lib/studio";

function ProfileForm({ initial }: { initial: CreatorProfile }) {
  const [p, setP] = useState(initial);
  const [saved, setSaved] = useState(false);
  const change = (patch: Partial<CreatorProfile>) => {
    setP({ ...p, ...patch });
    setSaved(false);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({ name: p.name.trim(), bio: p.bio.trim(), website: p.website.trim() });
    setSaved(true);
  };
  return (
    <div className="studio-grid">
      <form className="panel form" onSubmit={submit}>
        <label>
          Creator name <small>shown as “By …” on everything you publish</small>
          <input className="input" required maxLength={60} value={p.name} onChange={(e) => change({ name: e.target.value })} placeholder="Wilderness Awareness School" />
        </label>
        <label>
          About you
          <textarea className="input" maxLength={600} value={p.bio} onChange={(e) => change({ bio: e.target.value })} placeholder="Who you are, where you record, and what you hope listeners notice." />
        </label>
        <label>
          Website
          <input className="input" type="url" value={p.website} onChange={(e) => change({ website: e.target.value })} placeholder="https://" />
        </label>
        <div className="form-actions">
          {saved && <span className="note" role="status" style={{ alignSelf: "center" }}>Saved</span>}
          <button className="btn solid">Save profile</button>
        </div>
      </form>
      <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="panel">
          <h2>How listeners see you</h2>
          <div className="creator-card">
            <span className="avatar-sm">{(p.name.trim()[0] ?? "N").toUpperCase()}</span>
            <span>
              <b>{p.name.trim() || "Your name"}</b>
              <br />
              <span className="note">{p.bio.trim() ? p.bio.trim().slice(0, 90) + (p.bio.trim().length > 90 ? "…" : "") : "NatureMe creator"}</span>
            </span>
          </div>
        </section>
        <section className="panel">
          <h2>Payouts</h2>
          <p className="note">Creators are paid for every minute listened. Payouts need creator accounts and a payment provider, which come with the NatureMe backend.</p>
        </section>
      </aside>
    </div>
  );
}

export default function StudioProfilePage() {
  const { loaded, profile } = useStudio();
  return (
    <>
      <div className="studio-head">
        <div className="eyebrow">Profile</div>
        <h1 style={{ marginTop: 6 }}>Your creator profile</h1>
        <p>Kept in this browser until NatureMe has creator accounts.</p>
      </div>
      {loaded ? <ProfileForm initial={profile} /> : <p className="note">Loading…</p>}
    </>
  );
}
