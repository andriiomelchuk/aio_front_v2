import type { T_ContentPageLocale, T_LocalizedText } from "./types";

export const contentPageLocales: T_ContentPageLocale[] = ["uk", "en", "de", "ru"];

export const createLocalizedText = (locale?: T_ContentPageLocale, value = ""): T_LocalizedText => ({
  uk: locale === "uk" ? value : "",
  en: locale === "en" ? value : "",
  de: locale === "de" ? value : "",
  ru: locale === "ru" ? value : "",
});

export const getLocalizedText = (
  value: T_LocalizedText,
  locale: T_ContentPageLocale,
  fallbackLocale: T_ContentPageLocale,
) => value[locale]?.trim() || value[fallbackLocale]?.trim() || "";
