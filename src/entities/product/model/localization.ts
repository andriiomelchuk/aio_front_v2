import { locales, type T_Locale } from "@/shared/i18n/types";
import type { T_Product, T_ProductAttribute, T_ProductAttributeTranslation, T_ProductTranslation } from "./types";

export const createProductTranslation = (): T_ProductTranslation => ({
  title: "", shortDescription: "", description: "",
  seo: { title: "", description: "", keywords: [] },
  attributes: [], variants: {}, imageAlts: {},
});

const toTranslation = (attribute: T_ProductAttribute): T_ProductAttributeTranslation => ({
  sourceId: attribute.id, name: attribute.name, value: attribute.value,
});

export const getProductSourceTranslation = (product: T_Product): T_ProductTranslation => ({
  title: product.title,
  shortDescription: product.shortDescription ?? "",
  description: product.description,
  seo: { title: product.seo?.title ?? "", description: product.seo?.description ?? "", keywords: product.seo?.keywords ?? [] },
  attributes: product.attributes.map(toTranslation),
  variants: Object.fromEntries((product.variants ?? []).map((variant) => [variant.id, {
    title: variant.title, attributes: variant.attributes.map(toTranslation),
  }])),
  imageAlts: Object.fromEntries(product.images.map((image) => [image.id, image.alt ?? ""])),
});

const findAttribute = (items: T_ProductAttributeTranslation[], attribute: T_ProductAttribute, index: number) =>
  items.find((item) => attribute.id && item.sourceId === attribute.id) ?? items[index];

export const localizeProduct = (product: T_Product, locale: T_Locale, fallbackLocale: T_Locale): T_Product => {
  const sourceLocale = product.defaultLocale ?? fallbackLocale;
  const source = getProductSourceTranslation(product);
  const requested = locale === sourceLocale ? source : product.translations?.[locale];
  const fallback = fallbackLocale === sourceLocale ? source : product.translations?.[fallbackLocale];
  const translation = requested ?? fallback ?? source;
  return {
    ...product,
    title: translation.title.trim() || source.title,
    shortDescription: translation.shortDescription.trim() || source.shortDescription,
    description: translation.description.trim() || source.description,
    seo: {
      ...product.seo,
      title: translation.seo.title.trim() || source.seo.title,
      description: translation.seo.description.trim() || source.seo.description,
      keywords: translation.seo.keywords.length ? translation.seo.keywords : source.seo.keywords,
    },
    images: product.images.map((image) => ({ ...image, alt: translation.imageAlts[image.id]?.trim() || image.alt })),
    attributes: product.attributes.map((attribute, index) => {
      const localized = findAttribute(translation.attributes, attribute, index);
      return { ...attribute, name: localized?.name.trim() || attribute.name, value: localized?.value.trim() || attribute.value };
    }),
    variants: product.variants?.map((variant) => {
      const localized = translation.variants[variant.id];
      return {
        ...variant,
        title: localized?.title.trim() || variant.title,
        attributes: variant.attributes.map((attribute, index) => {
          const localizedAttribute = findAttribute(localized?.attributes ?? [], attribute, index);
          return { ...attribute, name: localizedAttribute?.name.trim() || attribute.name, value: localizedAttribute?.value.trim() || attribute.value };
        }),
      };
    }),
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const normalizeAttributes = (value: unknown): T_ProductAttributeTranslation[] => Array.isArray(value)
  ? value.filter(isRecord).map((item) => ({ sourceId: item.sourceId ? String(item.sourceId) : undefined, name: String(item.name ?? ""), value: String(item.value ?? "") }))
  : [];

export const normalizeProductTranslations = (value: unknown): Partial<Record<T_Locale, T_ProductTranslation>> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(locales.flatMap((locale) => {
    const raw = value[locale];
    if (!isRecord(raw)) return [];
    const seo = isRecord(raw.seo) ? raw.seo : {};
    const variants = isRecord(raw.variants) ? Object.fromEntries(Object.entries(raw.variants).flatMap(([id, item]) => {
      if (!isRecord(item)) return [];
      return [[id, { title: String(item.title ?? ""), attributes: normalizeAttributes(item.attributes) }]];
    })) : {};
    const imageAlts = isRecord(raw.imageAlts) ? Object.fromEntries(Object.entries(raw.imageAlts).map(([id, alt]) => [id, String(alt ?? "")])) : {};
    return [[locale, {
      title: String(raw.title ?? ""), shortDescription: String(raw.shortDescription ?? ""), description: String(raw.description ?? ""),
      seo: { title: String(seo.title ?? ""), description: String(seo.description ?? ""), keywords: Array.isArray(seo.keywords) ? seo.keywords.map(String) : [] },
      attributes: normalizeAttributes(raw.attributes), variants, imageAlts,
    }]];
  })) as Partial<Record<T_Locale, T_ProductTranslation>>;
};
