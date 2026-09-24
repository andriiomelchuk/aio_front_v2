import type { T_Locale } from "@/shared/i18n";
import type { T_Service, T_ServiceTranslation } from "./types";

export const getServiceSourceTranslation = (service: T_Service): T_ServiceTranslation => ({
  title: service.title,
  shortDescription: service.shortDescription,
  description: service.description,
  seoTitle: service.seo.title,
  seoDescription: service.seo.description,
  variantTitles: Object.fromEntries(service.variants.map((item) => [item.id, item.title])),
  addOnTitles: Object.fromEntries(service.addOns.map((item) => [item.id, item.title])),
});

export const localizeService = (service: T_Service, locale: T_Locale, fallback: T_Locale): T_Service => {
  const source = getServiceSourceTranslation(service);
  const translation = locale === service.defaultLocale
    ? source
    : service.translations[locale] ?? service.translations[fallback] ?? source;
  return {
    ...service,
    title: translation.title || source.title,
    shortDescription: translation.shortDescription || source.shortDescription,
    description: translation.description || source.description,
    seo: {
      ...service.seo,
      title: translation.seoTitle || source.seoTitle,
      description: translation.seoDescription || source.seoDescription,
    },
    variants: service.variants.map((item) => ({ ...item, title: translation.variantTitles[item.id] || item.title })),
    addOns: service.addOns.map((item) => ({ ...item, title: translation.addOnTitles[item.id] || item.title })),
  };
};
