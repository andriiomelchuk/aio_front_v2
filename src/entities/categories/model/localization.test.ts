import { describe, expect, it } from "vitest";
import type { T_Categories } from "./types";
import { localizeCategory, normalizeCategoryTranslations } from "./localization";

const category: T_Categories = {
  id: "1",
  slug: "beauty",
  name: "Beauty source",
  description: "Source description",
  status: "active",
  defaultLocale: "uk",
  translations: {
    en: { name: "Beauty", description: "English description" },
  },
};

describe("category localization", () => {
  it("uses the requested translation", () => {
    expect(localizeCategory(category, "en", "uk")).toMatchObject({
      name: "Beauty",
      description: "English description",
    });
  });

  it("falls back to the source language when a translation is missing", () => {
    expect(localizeCategory(category, "de", "uk")).toMatchObject({
      name: "Beauty source",
      description: "Source description",
    });
  });

  it("normalizes only supported language values", () => {
    expect(normalizeCategoryTranslations({
      en: { name: "Beauty", description: null },
      pl: { name: "Uroda", description: "Opis" },
    })).toEqual({
      en: { name: "Beauty", description: "" },
    });
  });
});
