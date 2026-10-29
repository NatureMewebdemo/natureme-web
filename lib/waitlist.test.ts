import { describe, expect, it } from "vitest";
import { parseWaitlistEntry } from "./waitlist";

describe("parseWaitlistEntry", () => {
  it("keeps a creator's formats and place", () => {
    const r = parseWaitlistEntry({ role: "creator", name: " Kai ", email: "Kai@Example.com", formats: ["Podcast", "Nope"], place: "Waipiʻo Valley" });
    expect(r).toEqual({ entry: { role: "creator", name: "Kai", email: "kai@example.com", formats: ["Podcast"], place: "Waipiʻo Valley" } });
  });

  it("drops creator fields for listeners", () => {
    const r = parseWaitlistEntry({ role: "listener", email: "a@b.co", formats: ["Podcast"], place: "x" });
    expect(r).toEqual({ entry: { role: "listener", name: "", email: "a@b.co", formats: [], place: "" } });
  });

  it("asks for a real email", () => {
    expect(parseWaitlistEntry({ email: "nope" })).toEqual({ error: "Enter an email address like you@example.com." });
    expect(parseWaitlistEntry(null)).toHaveProperty("error");
  });
});
