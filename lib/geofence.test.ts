import { describe, expect, it } from "vitest";
import { PIECES, REGIONS, SAMPLE_LOCATION } from "./content";
import { directionsUrl, fenceOf, fieldTally, howFar } from "./geofence";

const tideLine = PIECES["tide-line"];
const gullPoint = REGIONS.near.places.find((p) => p.id === "gull-point")!;

describe("fenceOf", () => {
  it("leaves pieces that aren't geofenced open", () => {
    expect(fenceOf(PIECES["waves"], SAMPLE_LOCATION, [])).toBe("open");
    expect(fenceOf(PIECES["walden"], SAMPLE_LOCATION, [])).toBe("open");
  });

  it("locks a geofenced piece until the listener is inside its place", () => {
    expect(fenceOf(tideLine, SAMPLE_LOCATION, [])).toBe("away");
    expect(fenceOf(tideLine, { lat: gullPoint.lat + 0.001, lng: gullPoint.lng }, [])).toBe("here");
  });

  it("keeps a captured piece playable anywhere", () => {
    expect(fenceOf(tideLine, SAMPLE_LOCATION, ["tide-line"])).toBe("captured");
  });

  it("ignores onSite on a piece with no place", () => {
    expect(fenceOf({ id: "x", onSite: true }, SAMPLE_LOCATION, [])).toBe("open");
  });
});

describe("helpers", () => {
  it("says how far a place is, by walking time or distance", () => {
    expect(howFar(SAMPLE_LOCATION, gullPoint)).toMatch(/min walk$/);
    expect(howFar(SAMPLE_LOCATION, REGIONS.hilo.places[0])).toMatch(/km away$/);
  });

  it("links to walking directions", () => {
    expect(directionsUrl(gullPoint)).toBe(`https://www.google.com/maps/dir/?api=1&destination=${gullPoint.lat},${gullPoint.lng}&travelmode=walking`);
  });

  it("tallies captured geofenced pieces", () => {
    const pieces = [tideLine, PIECES["waves"], PIECES["oaks-lean"]];
    expect(fieldTally(pieces, ["tide-line"])).toEqual({ total: 2, captured: 1 });
  });
});
