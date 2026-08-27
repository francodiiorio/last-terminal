import { describe, expect, it } from "vitest";
import { paragraphsFrom } from "@/os/desktop/EndingScreen";
import { ENDINGS } from "@content/endings/endings";
import { LANGUAGES } from "@/core/language";

describe("paragraphsFrom (regression: every source-wrapped line rendered as its own <p>, breaking sentences mid-thought)", () => {
  it("joins consecutive non-blank lines into one paragraph", () => {
    const lines = ["No further outbound traffic. No further pings toward Tantalus. Whatever is", "out there keeps whatever it was going to say next."];
    expect(paragraphsFrom(lines)).toEqual([
      "No further outbound traffic. No further pings toward Tantalus. Whatever is out there keeps whatever it was going to say next.",
    ]);
  });

  it("splits into separate paragraphs on a blank line", () => {
    const lines = ["First paragraph, one line.", "", "Second paragraph,", "wrapped across two lines."];
    expect(paragraphsFrom(lines)).toEqual(["First paragraph, one line.", "Second paragraph, wrapped across two lines."]);
  });

  it("ignores leading/trailing/consecutive blank lines", () => {
    expect(paragraphsFrom(["", "only paragraph", "", ""])).toEqual(["only paragraph"]);
  });

  it("returns an empty array for an all-blank input", () => {
    expect(paragraphsFrom([])).toEqual([]);
    expect(paragraphsFrom([""])).toEqual([]);
  });

  it("every real ending's body collapses to strictly fewer paragraphs than source lines (every ending actually has a wrapped line)", () => {
    for (const ending of ENDINGS) {
      for (const lang of LANGUAGES) {
        const lines = ending.body[lang];
        const paragraphs = paragraphsFrom(lines);
        expect(paragraphs.length).toBeLessThan(lines.length);
        // no paragraph should itself contain a leftover blank-line artifact
        expect(paragraphs.every((p) => p.length > 0)).toBe(true);
      }
    }
  });
});
