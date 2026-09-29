import { describe, expect, it } from "vitest";
import { piece } from "./content";
import { forYou } from "./preferences";

const fmt = (id: string) => piece(id).format;

describe("forYou", () => {
  it("follows the chosen traditions in order", () => {
    expect(forYou({ traditions: ["zen", "nordic"], formats: [] }, fmt)).toEqual(["stream-sit", "kinhin", "lavvu", "friluftsliv"]);
  });

  it("keeps only the chosen formats", () => {
    expect(forYou({ traditions: ["zen", "nordic", "sit-spot"], formats: ["course"] }, fmt)).toEqual(["friluftsliv", "sit-spot-seasons"]);
  });

  it("falls back to every format when none of the picks match", () => {
    expect(forYou({ traditions: ["zen"], formats: ["audiobook"] }, fmt)).toEqual(["stream-sit", "kinhin"]);
  });

  it("ignores unknown traditions and caps the list", () => {
    expect(forYou({ traditions: ["nope", "mindfulness", "zen", "shinrin-yoku", "sit-spot"], formats: [] }, fmt, 3)).toHaveLength(3);
  });
});
