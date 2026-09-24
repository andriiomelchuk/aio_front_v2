import { describe, expect, it } from "vitest";
import { dictionaries } from ".";

const serviceKeys = Object.keys(dictionaries.en).filter((key) => key.startsWith("services.") || key.startsWith("admin.services."));

describe("services localization", () => {
  it.each(["de", "uk", "ru"] as const)("provides translated copy for %s", (locale) => {
    const translated = serviceKeys.filter((key) => dictionaries[locale][key as keyof typeof dictionaries[typeof locale]] !== dictionaries.en[key as keyof typeof dictionaries.en]);
    expect(translated.length / serviceKeys.length).toBeGreaterThan(0.8);
  });
});
