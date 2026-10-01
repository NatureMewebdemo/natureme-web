"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlaceMap } from "@/components/PlaceMap";
import { newId, saveUpload, useStudio } from "@/components/useStudio";
import { ALL_PLACES, FORMATS, REGIONS, WAYS, type FormatId, type RegionId, type WayId } from "@/lib/content";
import { canPublish, defaultPrice, isPaid, lengthLabel, priceLabel, runChecks, suggestPlaces, type Upload } from "@/lib/studio";
import { Alert, Tick, UploadIcon } from "./icons";

const STEPS = ["Audio", "Details", "Place", "Publish"] as const;
/** Large enough for an audiobook chapter; browsers may refuse more. */
const MAX_BYTES = 500 * 1024 * 1024;

function audioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => resolve(Number.isFinite(a.duration) ? a.duration : 0);
    a.onerror = () => resolve(0);
    a.src = url;
  });
}

const regionOf = (placeId?: string): RegionId =>
  (Object.keys(REGIONS) as RegionId[]).find((r) => REGIONS[r].places.some((p) => p.id === placeId)) ?? "near";

export function UploadForm() {
  const router = useRouter();
  const editId = useSearchParams().get("id");
  const { loaded, uploads, audio } = useStudio();
  const existing = editId ? uploads.find((u) => u.id === editId) : undefined;

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [over, setOver] = useState(false);
  const [durationSec, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transcript, setTranscript] = useState("");
  const [format, setFormatRaw] = useState<FormatId>("story");
  /** Price as typed; empty means free. */
  const [priceText, setPriceText] = useState("");
  const [priceTouched, setPriceTouched] = useState(false);
  const setFormat = (f: FormatId) => {
    setFormatRaw(f);
    // Suggest the usual price for the format until the creator sets their own.
    if (!priceTouched) setPriceText(defaultPrice(f)?.toFixed(2) ?? "");
  };
  const [traditionIds, setTraditions] = useState<string[]>([]);
  const [placeId, setPlaceId] = useState<string | undefined>();
  const [regionId, setRegionId] = useState<RegionId>("near");
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Fill the form once when editing.
  const filled = useRef(false);
  useEffect(() => {
    if (filled.current || !existing) return;
    filled.current = true;
    setTitle(existing.title);
    setDescription(existing.description);
    setFormatRaw(existing.format);
    setPriceText(isPaid(existing.price) ? existing.price.toFixed(2) : "");
    setPriceTouched(true);
    setTraditions(existing.traditionIds);
    setPlaceId(existing.placeId);
    setRegionId(regionOf(existing.placeId));
    setDuration(existing.durationSec);
  }, [existing]);

  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  const pick = async (f: File | undefined) => {
    setFileError("");
    if (!f) return;
    if (!f.type.startsWith("audio/") && !/\.(mp3|m4a|aac|wav|ogg|oga|flac|opus|webm)$/i.test(f.name)) {
      setFileError("That doesn't look like an audio file. Try MP3, M4A, WAV, OGG or FLAC.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError("Files up to 500 MB work for now. Split longer recordings into parts.");
      return;
    }
    const url = URL.createObjectURL(f);
    const seconds = await audioDuration(url);
    if (!seconds) {
      URL.revokeObjectURL(url);
      setFileError("This browser couldn't read the recording's length. MP3 or M4A usually work.");
      return;
    }
    setFile(f);
    setFileUrl(url);
    setDuration(seconds);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  };

  const previewUrl = fileUrl ?? (existing ? existing.audioUrl ?? audio[existing.id] : undefined);
  const hasAudio = !!previewUrl;
  const typed = Math.round(Number(priceText) * 100) / 100;
  const price = priceText.trim() && Number.isFinite(typed) ? typed : undefined;
  const checks = runChecks({ title, description, format, durationSec, placeId, traditionIds, hasAudio, price: priceText.trim() ? (isPaid(price) ? price : -1) : undefined });
  const ready = canPublish(checks);
  const suggestions = useMemo(() => suggestPlaces(`${title} ${description} ${transcript}`).slice(0, 3), [title, description, transcript]);
  const place = ALL_PLACES.find((p) => p.id === placeId);

  const save = async (status: Upload["status"]) => {
    setSaving(true);
    const now = new Date().toISOString();
    const u: Upload = {
      id: existing?.id ?? newId(),
      title: title.trim(),
      description: description.trim(),
      format,
      traditionIds,
      placeId,
      durationSec: Math.round(durationSec),
      price: isPaid(price) ? price : undefined,
      status,
      source: existing?.source ?? "upload",
      audioUrl: existing?.audioUrl,
      fileName: file?.name ?? existing?.fileName,
      feedTitle: existing?.feedTitle,
      createdAt: existing?.createdAt ?? now,
      publishedAt: status === "published" ? existing?.publishedAt ?? now : existing?.publishedAt,
    };
    try {
      await saveUpload(u, file ?? undefined);
      router.push(status === "published" ? `/studio?published=${u.id}` : "/studio");
    } catch {
      setSaving(false);
      setFileError("Saving failed. The browser may be out of storage space.");
      setStep(0);
    }
  };

  if (editId && loaded && !existing) return <p className="note">That upload isn&apos;t on this device any more.</p>;

  const toggleTradition = (id: string) => setTraditions((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  return (
    <div className="form">
      <nav className="steps" aria-label="Upload steps">
        {STEPS.map((s, i) => (
          <button key={s} aria-current={step === i ? "step" : undefined} onClick={() => setStep(i)} disabled={i > 0 && !hasAudio}>
            <i>{i + 1}</i>{s}
          </button>
        ))}
      </nav>

      {step === 0 && (
        <section className="panel">
          <h2>{existing ? "Your recording" : "Choose a recording"}</h2>
          {existing?.source === "rss" ? (
            <p className="note">This episode plays from {existing.feedTitle ?? "its podcast feed"}, so there&apos;s no file to replace.</p>
          ) : (
            <div
              className={`drop${over ? " over" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => input.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
            >
              <UploadIcon size={30} />
              <b>{hasAudio ? "Replace the audio file" : "Drop an audio file here, or choose one"}</b>
              <p>MP3, M4A, WAV, OGG or FLAC, up to 500 MB.</p>
              <input ref={input} type="file" accept="audio/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
            </div>
          )}
          {fileError && <p className="err" role="alert">{fileError}</p>}
          {previewUrl && (
            <div className="file-card">
              <span><b>{file?.name ?? existing?.fileName ?? existing?.title}</b></span>
              <span className="mono note">{lengthLabel(durationSec)}{file ? ` · ${(file.size / 1024 / 1024).toFixed(1)} MB` : ""}</span>
              <audio controls src={previewUrl} preload="metadata" />
            </div>
          )}
          <div className="form-actions">
            <button className="btn solid" disabled={!hasAudio} onClick={() => setStep(1)}>Next: details</button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="panel">
          <h2>Tell listeners what they&apos;ll hear</h2>
          <label>
            Title
            <input className="input" value={title} maxLength={90} onChange={(e) => setTitle(e.target.value)} placeholder="What the old cedars remember" />
          </label>
          <label>
            Description
            <textarea className="input" value={description} maxLength={2000} onChange={(e) => setDescription(e.target.value)} placeholder="Where it was recorded, what you'll notice, who it's for." />
          </label>
          <div className="form">
            <span className="field-label">Format</span>
            <div className="chips" role="group" aria-label="Format">
              {(Object.keys(FORMATS) as FormatId[]).map((k) => (
                <button key={k} className="chip" aria-pressed={format === k} onClick={() => setFormat(k)} style={{ ["--c" as string]: `var(${FORMATS[k].color})` }}>
                  <i />{FORMATS[k].name}
                </button>
              ))}
            </div>
          </div>
          <div className="form" style={{ gap: 8 }}>
            <span className="field-label">Price <small>you choose; audiobooks are usually paid</small></span>
            <div className="price-row">
              <div className="chips" role="group" aria-label="Free or paid">
                <button className="chip" aria-pressed={!priceText} onClick={() => { setPriceTouched(true); setPriceText(""); }}>Free</button>
                <button className="chip" aria-pressed={!!priceText} onClick={() => { setPriceTouched(true); setPriceText(priceText || (defaultPrice(format) ?? 4.99).toFixed(2)); }}>Paid</button>
              </div>
              {!!priceText && (
                <label className="price-input" aria-label="Price in US dollars">
                  <span>$</span>
                  <input className="input" inputMode="decimal" value={priceText} onChange={(e) => { setPriceTouched(true); setPriceText(e.target.value.replace(/[^0-9.]/g, "")); }} />
                </label>
              )}
            </div>
            <p className="note">{priceText ? "Listeners pay once to own it, and you earn what they pay." : "Free pieces earn per minute listened."}</p>
          </div>
          {(Object.keys(WAYS) as WayId[]).map((w) => (
            <div key={w} className="form" style={{ gap: 8 }}>
              <span className="field-label">{WAYS[w].label} <small>optional, puts the piece in Explore</small></span>
              <div className="chips" role="group" aria-label={WAYS[w].label}>
                {WAYS[w].traditions.map((t) => (
                  <button key={t.id} className="chip" aria-pressed={traditionIds.includes(t.id)} onClick={() => toggleTradition(t.id)}>{t.name}</button>
                ))}
              </div>
            </div>
          ))}
          <label>
            Transcript or show notes <small>optional, only used to suggest places; not published</small>
            <textarea className="input" value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste a transcript and NatureMe looks for the places you mention." />
          </label>
          <div className="form-actions">
            <button className="btn line" onClick={() => setStep(0)}>Back</button>
            <button className="btn solid" onClick={() => setStep(2)}>Next: place</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="panel">
          <h2>Pin it to a place</h2>
          <p className="note">Listeners hear pinned pieces when they&apos;re near the place, and travellers can explore them from afar.</p>
          {suggestions.length > 0 && (
            <div className="suggest">
              <span className="eyebrow">Suggested from your words</span>
              {suggestions.map((s) => {
                const p = ALL_PLACES.find((x) => x.id === s.placeId)!;
                return (
                  <button key={s.placeId} aria-pressed={placeId === s.placeId} onClick={() => { setPlaceId(s.placeId); setRegionId(regionOf(s.placeId)); }}>
                    <span><b>{p.name}</b><br /><small>Mentions {s.matched.map((m) => `“${m}”`).join(", ")}</small></span>
                    <span className="note">{p.kind}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="chips">
            {(Object.keys(REGIONS) as RegionId[]).map((r) => (
              <button key={r} className="chip" aria-pressed={regionId === r} onClick={() => setRegionId(r)}>{REGIONS[r].label.replace("Near me", "Pacific Northwest")}</button>
            ))}
          </div>
          <PlaceMap region={REGIONS[regionId]} regionKey={regionId} selected={placeId ?? ""} onSelect={setPlaceId} />
          <div className="chips" role="group" aria-label="Places">
            {REGIONS[regionId].places.map((p) => (
              <button key={p.id} className="chip" aria-pressed={placeId === p.id} onClick={() => setPlaceId(p.id)}>{p.name}</button>
            ))}
            <button className="chip" aria-pressed={!placeId} onClick={() => setPlaceId(undefined)}>Not tied to a place</button>
          </div>
          <p className="note">Pinning a brand-new place comes with the NatureMe backend; for now choose one of the mapped places.</p>
          <div className="form-actions">
            <button className="btn line" onClick={() => setStep(1)}>Back</button>
            <button className="btn solid" onClick={() => setStep(3)}>Next: review</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="panel">
          <h2>Automated checks</h2>
          <p className="note">NatureMe checks every piece before it goes live instead of holding it for manual review. Red items stop publishing; amber ones are advice.</p>
          <ul className="checks">
            {checks.map((c) => (
              <li key={c.id} className={c.ok ? "ok" : c.blocking ? "block" : "warn"}>
                {c.ok ? <Tick /> : <Alert />}
                <span>{c.label}</span>
                {!c.ok && c.detail && <small>{c.detail}</small>}
              </li>
            ))}
          </ul>
          <div className="creator-card">
            <span className="avatar-sm">{FORMATS[format].short[0]}</span>
            <span>
              <b>{title || "Untitled"}</b>
              <br />
              <span className="note">{FORMATS[format].name} · {lengthLabel(durationSec)} · {place ? place.name : "Anywhere"} · {priceLabel(isPaid(price) ? price : undefined)}</span>
            </span>
          </div>
          <div className="form-actions">
            <button className="btn line" onClick={() => setStep(2)}>Back</button>
            <button className="btn line" disabled={saving || !hasAudio} onClick={() => save("draft")}>Save as draft</button>
            <button className="btn solid" disabled={saving || !ready} onClick={() => save("published")}>{existing?.status === "published" ? "Save and keep live" : "Publish"}</button>
          </div>
        </section>
      )}
    </div>
  );
}
