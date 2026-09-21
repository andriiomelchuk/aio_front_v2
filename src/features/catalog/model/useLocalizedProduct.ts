"use client";
import { useMemo } from "react";
import { localizeProduct, type T_Product } from "@/entities/product";
import { useI18n } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";

export const useLocalizedProduct = (product: T_Product) => {
  const { locale } = useI18n();
  const { localization } = useSiteSettings();
  return useMemo(() => localizeProduct(product, locale, localization.defaultLocale), [locale, localization.defaultLocale, product]);
};

export const useLocalizedProducts = (products: T_Product[]) => {
  const { locale } = useI18n();
  const settings = useSiteSettings();

  return useMemo(
    () =>
      products.map((product) =>
        localizeProduct(product, locale, settings.localization.defaultLocale),
      ),
    [locale, products, settings.localization.defaultLocale],
  );
};
