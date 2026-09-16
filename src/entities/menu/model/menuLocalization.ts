import { locales, type T_Locale } from "@/shared/i18n";
import type { T_MenuLocalizedText } from "./types";

export const createMenuLocalizedText = (
  locale: T_Locale = "uk",
  value = "",
): T_MenuLocalizedText => ({ uk: "", en: "", de: "", ru: "", [locale]: value });

export const getMenuLocalizedText = (
  value: T_MenuLocalizedText,
  locale: T_Locale,
  fallbackLocale: T_Locale,
) => value[locale]?.trim() || value[fallbackLocale]?.trim() || locales.map((item) => value[item]?.trim()).find(Boolean) || "";
