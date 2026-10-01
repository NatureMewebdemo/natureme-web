import { describe, expect, it } from "vitest";
import { canPublish, earnings, lengthLabel, parseDuration, parseRss, runChecks, suggestPlaces, toPiece, type Upload } from "./studio";

const base = { title: "Reading the tide line", description: "A slow walk along the wrack line at low tide, listening for what the sea left behind.", format: "story" as const, durationSec: 540, placeId: "gull-point", traditionIds: ["mindfulness"], hasAudio: true };

describe("runChecks", () => {
  it("passes a complete piece", () => {
    const checks = runChecks(base);
    expect(checks.every((c) => c.ok)).toBe(true);
    expect(canPublish(checks)).toBe(true);
  });

  it("blocks publishing without audio or with harmful text", () => {
    expect(canPublish(runChecks({ ...base, hasAudio: false }))).toBe(false);
    expect(canPublish(runChecks({ ...base, description: "nazi symbols in the woods" }))).toBe(false);
    expect(canPublish(runChecks({ ...base, durationSec: 10 }))).toBe(false);
  });

  it("only advises on missing place, tags and a short description", () => {
    const checks = runChecks({ ...base, placeId: undefined, traditionIds: [], description: "Short." });
    expect(canPublish(checks)).toBe(true);
    expect(checks.filter((c) => !c.ok).map((c) => c.id)).toEqual(["description", "place", "tradition"]);
  });
});

describe("suggestPlaces", () => {
  it("pins by a place's distinctive name", () => {
    const [top] = suggestPlaces("How the beavers remade Sorrel Creek, episode 4");
    expect(top.placeId).toBe("sorrel-valley");
    expect(top.matched).toContain("sorrel");
  });

  it("uses region words only as extra weight", () => {
    expect(suggestPlaces("Stories from Hawaii")).toEqual([]);
    expect(suggestPlaces("Fishponds of Hilo Bay, Hawaiʻi")[0].placeId).toBe("hilo-bay");
  });

  it("ignores accents and okina", () => {
    expect(suggestPlaces("A walk up the wailuku river")[0].placeId).toBe("wailuku");
  });

  it("finds nothing in unrelated text", () => {
    expect(suggestPlaces("An interview about bookkeeping")).toEqual([]);
  });
});

describe("parseDuration", () => {
  it("reads seconds, mm:ss and hh:mm:ss", () => {
    expect(parseDuration("3723")).toBe(3723);
    expect(parseDuration("62:03")).toBe(3723);
    expect(parseDuration("1:02:03")).toBe(3723);
    expect(parseDuration("soon")).toBe(0);
    expect(parseDuration(undefined)).toBe(0);
  });
});

describe("parseRss", () => {
  const xml = `<?xml version="1.0"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
<channel>
  <title>Out on the Ridge</title>
  <item>
    <title><![CDATA[Trail talk: the switchbacks]]></title>
    <description>&lt;p&gt;Up the &lt;b&gt;Ridgeback&lt;/b&gt; Trail &amp;amp; back.&lt;/p&gt;</description>
    <guid isPermaLink="false">ep-3</guid>
    <enclosure url="https://cdn.example.com/ep3.mp3" length="1" type="audio/mpeg"/>
    <itunes:duration>28:00</itunes:duration>
    <pubDate>Tue, 29 Sep 2026 08:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Video bonus</title>
    <enclosure url="https://cdn.example.com/bonus.mp4" type="video/mp4"/>
  </item>
  <item><title>No audio</title></item>
</channel>
</rss>`;

  it("reads the show and its audio episodes", () => {
    const feed = parseRss(xml);
    expect(feed.title).toBe("Out on the Ridge");
    expect(feed.episodes).toHaveLength(1);
    expect(feed.episodes[0]).toMatchObject({
      guid: "ep-3",
      title: "Trail talk: the switchbacks",
      description: "Up the Ridgeback Trail & back.",
      audioUrl: "https://cdn.example.com/ep3.mp3",
      durationSec: 1680,
    });
  });

  it("auto-pins an episode from its notes", () => {
    const ep = parseRss(xml).episodes[0];
    expect(suggestPlaces(`${ep.title} ${ep.description}`)[0].placeId).toBe("ridgeback");
  });
});

describe("earnings and pieces", () => {
  it("pays per listened minute", () => {
    expect(earnings(600, 0.005)).toBeCloseTo(0.05);
  });

  it("labels lengths like the catalogue", () => {
    expect(lengthLabel(20)).toBe("1 min");
    expect(lengthLabel(14 * 60)).toBe("14 min");
    expect(lengthLabel(65 * 60)).toBe("1 h 5 min");
    expect(lengthLabel(120 * 60)).toBe("2 h");
  });

  it("turns an upload into a listener piece", () => {
    const u: Upload = { ...base, id: "u-1", status: "published", source: "upload", createdAt: "2026-10-01T00:00:00Z" };
    expect(toPiece(u, "Mara", "blob:x")).toMatchObject({ id: "u-1", by: "By Mara", length: "9 min", seconds: 540, audio: "blob:x", uploaded: true, placeId: "gull-point" });
  });
});
