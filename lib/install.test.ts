import { describe, expect, it } from "vitest";
import { installRoute, shouldOfferInstall } from "./install";

const now = new Date(2026, 9, 1);
const base = { standalone: false, hasListened: false, now };

describe("shouldOfferInstall", () => {
  it("waits until the listener has listened or come back", () => {
    expect(shouldOfferInstall({ visits: 1 }, base)).toBe(false);
    expect(shouldOfferInstall({ visits: 1 }, { ...base, hasListened: true })).toBe(true);
    expect(shouldOfferInstall({ visits: 2 }, base)).toBe(true);
  });

  it("never asks inside the installed app", () => {
    expect(shouldOfferInstall({ visits: 5 }, { ...base, standalone: true })).toBe(false);
    expect(shouldOfferInstall({ visits: 5, installed: true }, base)).toBe(false);
  });

  it("stays quiet for two weeks after Not now", () => {
    const dismissedAt = new Date(2026, 8, 25).toISOString();
    expect(shouldOfferInstall({ visits: 5, dismissedAt }, base)).toBe(false);
    expect(shouldOfferInstall({ visits: 5, dismissedAt }, { ...base, now: new Date(2026, 9, 10) })).toBe(true);
  });
});

describe("installRoute", () => {
  it("uses the browser prompt when there is one, and Share instructions on iPhone", () => {
    expect(installRoute("anything", true)).toBe("prompt");
    expect(installRoute("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", false)).toBe("ios");
    expect(installRoute("Mozilla/5.0 (X11; Linux x86_64) Firefox/130.0", false)).toBe("menu");
  });
});
