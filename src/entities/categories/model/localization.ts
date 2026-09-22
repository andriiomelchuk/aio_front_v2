import { locales, type T_Locale } from "@/shared/i18n";
import type { T_Categories, T_CategoryTranslation } from "./types";

export const createCategoryTranslation = (): T_CategoryTranslation => ({
  name: "",
  description: "",
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const normalizeCategoryTranslations = (
  value: unknown,
): Partial<Record<T_Locale, T_CategoryTranslation>> => {
  if (!isRecord(value)) return {};

  return Object.fromEntries(locales.flatMap((locale) => {
    const translation = value[locale];
    if (!isRecord(translation)) return [];
    return [[locale, {
      name: String(translation.name ?? ""),
      description: String(translation.description ?? ""),
    }]];
  })) as Partial<Record<T_Locale, T_CategoryTranslation>>;
};

export const localizeCategory = (
  category: T_Categories,
  locale: T_Locale,
  fallbackLocale: T_Locale,
): T_Categories => {
  const sourceLocale = category.defaultLocale ?? fallbackLocale;
  const requested = locale === sourceLocale ? undefined : category.translations?.[locale];
  const fallback = fallbackLocale === sourceLocale ? undefined : category.translations?.[fallbackLocale];
  const translation = requested ?? fallback;

  return {
    ...category,
    name: translation?.name.trim() || category.name,
    description: translation?.description.trim() || category.description,
  };
};
