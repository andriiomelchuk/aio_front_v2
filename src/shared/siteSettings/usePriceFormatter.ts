"use client";

import { useCallback } from "react";
import { useI18n } from "@/shared/i18n";
import { useSiteSettings } from "./SiteSettingsProvider";

const localeCodes = { uk: "uk-UA", en: "en-US", de: "de-DE", ru: "ru-RU" } as const;

export const usePriceFormatter = () => {
  const { locale } = useI18n();
  const settings = useSiteSettings();

  return useCallback(
    (value: number, currency = settings.localization.currency) =>
      new Intl.NumberFormat(localeCodes[locale], {
        style: "currency",
        currency,
      }).format(value),
    [locale, settings.localization.currency],
  );
};
