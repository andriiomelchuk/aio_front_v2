"use client";

import { useMemo } from "react";
import { localizeCategory, type T_Categories } from "@/entities/categories";
import { useI18n } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";

export const useLocalizedCategory = (category: T_Categories) => {
  const { locale } = useI18n();
  const { localization } = useSiteSettings();
  return useMemo(
    () => localizeCategory(category, locale, localization.defaultLocale),
    [category, locale, localization.defaultLocale],
  );
};

export const useLocalizedCategories = (categories: T_Categories[]) => {
  const { locale } = useI18n();
  const { localization } = useSiteSettings();
  return useMemo(
    () => categories.map((category) => localizeCategory(category, locale, localization.defaultLocale)),
    [categories, locale, localization.defaultLocale],
  );
};
