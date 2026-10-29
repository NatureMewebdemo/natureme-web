"use client";

import { useState } from "react";
import { CREATOR_FORMATS, type WaitlistRole } from "@/lib/waitlist";

/** The coming-soon waitlist. Creators by default; listeners can switch to a shorter form. */
export function Waitlist() {
  const [role, setRole] = useState<WaitlistRole>("creator");
  const [formats, setFormats] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const creator = role === "creator";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, name: form.get("name"), email: form.get("email"), place: form.get("place"), formats }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't save that just now. Try again in a minute.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="ls-card ls-done" role="status">
        <p className="ls-done-title">See you outside.</p>
        <p>{creator ? "Founding creators hear from us first, with early access to NatureMe Studio." : "We'll email you when the first places open near you."}</p>
      </div>
    );
  }

  return (
    <form className="ls-card" onSubmit={submit}>
      <div className="ls-switch" role="group" aria-label="I am joining as">
        <button type="button" aria-pressed={creator} onClick={() => setRole("creator")}>I make audio</button>
        <button type="button" aria-pressed={!creator} onClick={() => setRole("listener")}>I want to listen</button>
      </div>
      <div className="ls-row">
        <label>Name<input name="name" type="text" autoComplete="name" placeholder="Your name" /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      </div>
      {creator && (
        <>
          <fieldset className="ls-formats">
            <legend>What do you make?</legend>
            <div>
              {CREATOR_FORMATS.map((f) => (
                <button key={f} type="button" aria-pressed={formats.includes(f)} onClick={() => setFormats((l) => (l.includes(f) ? l.filter((x) => x !== f) : [...l, f]))}>
                  {f}
                </button>
              ))}
            </div>
          </fieldset>
          <label>Where does your audio belong?<input name="place" type="text" placeholder="A trail, a beach, a city park, a whole region" /></label>
        </>
      )}
      {error && <p className="ls-error" role="alert">{error}</p>}
      <button className="ls-submit" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : creator ? "Join the creator waitlist" : "Tell me when it opens"}
      </button>
    </form>
  );
}
