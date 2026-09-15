import { describe, expect, it } from "vitest";
import { createLocalizedText, getLocalizedText } from "./localization";

describe("content page localization", () => {
  it("creates an empty translation map with a selected initial value", () => {
    expect(createLocalizedText("uk", "Заголовок")).toEqual({
      uk: "Заголовок",
      en: "",
      de: "",
      ru: "",
    });
  });

  it("falls back to the page default locale", () => {
    const value = createLocalizedText("en", "About us");

    expect(getLocalizedText(value, "de", "en")).toBe("About us");
  });
});
