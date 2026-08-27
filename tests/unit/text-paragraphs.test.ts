import { describe, expect, it } from "vitest";
import { paragraphsFrom } from "@/core/text";
import { ENDINGS } from "@content/endings/endings";
import { CAMERA_FEEDS } from "@content/cameras/feeds";
import { MESSAGES } from "@content/emails/messages";
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

  it("trims each line before joining, so a quoted block's indentation doesn't leave a double space where two lines meet", () => {
    // content/emails/messages.ts's "communications-incoming" quote block: a 2-line indented
    // fragment that must join into one clean sentence, not one with a 3-space gap in the middle.
    const lines = [
      '  "...still reading, Priya. Confirm null point recalibration,',
      '  please confirm..."',
    ];
    expect(paragraphsFrom(lines)).toEqual(['"...still reading, Priya. Confirm null point recalibration, please confirm..."']);
  });

  it("camera feed bodies keep standalone header/telemetry lines separate while joining wrapped prose", () => {
    for (const feed of CAMERA_FEEDS) {
      for (const lang of LANGUAGES) {
        const lines = feed.body[lang];
        const paragraphs = paragraphsFrom(lines);
        // header line(s) still render as their own paragraph, distinct from the prose paragraph
        expect(paragraphs[0]).not.toContain("Resolution");
        expect(paragraphs[0]).not.toContain("Resolución");
        expect(paragraphs.every((p) => p.length > 0)).toBe(true);
      }
    }
  });

  it("comms message bodies keep letterhead fields (To/Cc/Classification) as separate lines, not glued into one run-on paragraph", () => {
    const correspondence = MESSAGES.find((m) => m.id === "concord-correspondence")!;
    const paragraphs = paragraphsFrom(correspondence.body.en);
    expect(paragraphs).toContain("CONCORD HQ -- SECURE CORRESPONDENCE (ARCHIVED)");
    expect(paragraphs).toContain("To: AION-7 / Dr. P. Anand-Kel");
    expect(paragraphs).toContain("Cc: AION-7 / CASSIUS (station custodian process)");
    expect(paragraphs).toContain("Classification: RESTRICTED -- SIGNAL PROGRAM");
    // and the actual wrapped-sentence paragraph still joins correctly
    expect(paragraphs).toContain(
      "MD 90 -- Findings reviewed. Confirmed: not consistent with any known uncrewed platform in our own catalogue or partner catalogues.",
    );
  });

  it("the es-AR communications-incoming body joins a wrapped field value (Tipo de señal) that spans two source lines", () => {
    const incoming = MESSAGES.find((m) => m.id === "communications-incoming")!;
    const paragraphs = paragraphsFrom(incoming.body["es-AR"]);
    expect(paragraphs).toContain("Tipo de señal: no repetitiva (no coincide con la línea base de la Señal del Coro)");
  });
});
