import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/store";
import { pick, LANGUAGES, DEFAULT_LANGUAGE, type Localized } from "@/core/language";
import { EN } from "@/i18n/en";
import { ES_AR } from "@/i18n/es-AR";

/** Recursively collect the key-path set of an object, treating functions/arrays/strings as leaves. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [prefix];
  const paths: string[] = [];
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    paths.push(...keyPaths(child, prefix ? `${prefix}.${key}` : key));
  }
  return paths;
}

describe("i18n string dictionary parity", () => {
  it("EN and ES_AR expose the exact same key paths", () => {
    expect(keyPaths(ES_AR).sort()).toEqual(keyPaths(EN).sort());
  });
});

describe("pick()", () => {
  const value: Localized<string> = { en: "hello", "es-AR": "hola" };

  it("returns the requested language's value", () => {
    expect(pick(value, "en")).toBe("hello");
    expect(pick(value, "es-AR")).toBe("hola");
  });

  it("falls back to the default language when a value is missing", () => {
    const partial = { en: "hello" } as unknown as Localized<string>;
    expect(pick(partial, "es-AR")).toBe("hello");
  });

  it("DEFAULT_LANGUAGE is included in LANGUAGES", () => {
    expect(LANGUAGES).toContain(DEFAULT_LANGUAGE);
  });
});

describe("terminal command output follows the settings language", () => {
  beforeEach(() => {
    useGameStore.getState().newGame();
    // newGame() deliberately preserves the language preference (like volume/reducedMotion) --
    // reset it explicitly so these tests don't depend on run order.
    useGameStore.getState().setLanguage("en");
  });

  it("defaults to English", () => {
    useGameStore.getState().runCommand("status");
    const output = useGameStore.getState().terminal.output;
    expect(output.some((line) => line.text.includes("AION-7 -- STATION STATUS"))).toBe(true);
  });

  it("switches to Argentine Spanish once setLanguage is called", () => {
    useGameStore.getState().setLanguage("es-AR");
    useGameStore.getState().runCommand("status");
    const output = useGameStore.getState().terminal.output;
    expect(output.some((line) => line.text.includes("AION-7 -- ESTADO DE LA ESTACIÓN"))).toBe(true);
    expect(output.some((line) => line.text.includes("AION-7 -- STATION STATUS"))).toBe(false);
  });

  it("localizes an unknown-command error", () => {
    useGameStore.getState().setLanguage("es-AR");
    useGameStore.getState().runCommand("bogus");
    const lastLine = useGameStore.getState().terminal.output.at(-1);
    expect(lastLine?.text).toBe("comando no encontrado: bogus");
  });

  it("localizes a narrative file body read via cat", () => {
    useGameStore.getState().setLanguage("es-AR");
    useGameStore.getState().runCommand("cat /system/status.log");
    const output = useGameStore.getState().terminal.output;
    expect(output.some((line) => line.text.includes("ESTADO DEL SISTEMA TOS"))).toBe(true);
  });

  it("switching language mid-session re-localizes the very next command, not just new sessions", () => {
    useGameStore.getState().runCommand("whoami");
    let output = useGameStore.getState().terminal.output;
    expect(output.some((line) => line.text.includes("SYSTEMS & LOGISTICS OFFICER"))).toBe(true);

    useGameStore.getState().setLanguage("es-AR");
    useGameStore.getState().runCommand("whoami");
    output = useGameStore.getState().terminal.output;
    expect(output.some((line) => line.text.includes("OFICIAL DE SISTEMAS Y LOGÍSTICA"))).toBe(true);
  });
});

describe("save/load round-trips the language setting", () => {
  beforeEach(() => {
    useGameStore.getState().newGame();
  });

  it("persists the chosen language through exportSnapshot/loadSnapshot", () => {
    useGameStore.getState().setLanguage("es-AR");
    const snapshot = useGameStore.getState().exportSnapshot();
    expect(snapshot.settings.language).toBe("es-AR");

    useGameStore.getState().setLanguage("en");
    useGameStore.getState().loadSnapshot(snapshot);
    expect(useGameStore.getState().settings.language).toBe("es-AR");
  });
});
