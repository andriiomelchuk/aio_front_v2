"use client";

import { createContext, useContext, useState } from "react";
import { createProductTranslation, getProductSourceTranslation, normalizeProductTranslations, type T_Product, type T_ProductAttribute, type T_ProductImage, type T_ProductTranslation, type T_ProductVariant } from "@/entities/product";
import { locales, useI18n, type T_Locale } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";
import { Input, Select, Textarea } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

type Props = Pick<T_ProductSectionProps, "sectionControl" | "errors"> & { product?: T_Product; attributes: T_ProductAttribute[]; variants: T_ProductVariant[]; images: T_ProductImage[] };
type FieldProps = { label: string; defaultLocale: T_Locale; values: Partial<Record<T_Locale, string>>; multiline?: boolean; error?: string; onChange: (locale: T_Locale, value: string) => void };
const TranslationStatusContext = createContext<Partial<Record<T_Locale, string>>>({});

const TranslationField = ({ label, defaultLocale, values, multiline, error, onChange }: FieldProps) => {
  const { t } = useI18n();
  const { localization } = useSiteSettings();
  const statuses = useContext(TranslationStatusContext);
  const options = [defaultLocale, ...localization.enabledLocales.filter((locale) => locale !== defaultLocale)];
  const [locale, setLocale] = useState<T_Locale>(defaultLocale);
  const props = { label, value: values[locale] ?? "", error: locale === defaultLocale ? error : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(locale, event.target.value) };
  return <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end">
    <Select aria-label={`${label} ${t("admin.product.translations.language")}`} label={t("admin.product.translations.language")} value={locale} onChange={(event) => setLocale(event.target.value as T_Locale)} options={options.map((value) => ({ value, label: `${t(`language.${value}`)} - ${statuses[value] ?? t("admin.product.translations.empty")}` }))} />
    {multiline ? <Textarea {...props} /> : <Input {...props} type="text" className="h-10" />}
  </div>;
};

export const ProductTranslationsSection = ({ product, attributes, variants, images, errors, sectionControl }: Props) => {
  const { t } = useI18n();
  const { localization } = useSiteSettings();
  const defaultLocale = product?.defaultLocale ?? localization.defaultLocale;
  const [translations, setTranslations] = useState(() => normalizeProductTranslations(product?.translations));
  const patch = (locale: T_Locale, changes: Partial<T_ProductTranslation>) => setTranslations((current) => ({ ...current, [locale]: { ...(current[locale] ?? createProductTranslation()), ...changes } }));
  const values = (read: (translation: T_ProductTranslation) => string) => Object.fromEntries(locales.map((locale) => [locale, currentValue(translations[locale], read)])) as Partial<Record<T_Locale, string>>;
  const withSource = (translated: Partial<Record<T_Locale, string>>, source: string) => ({ ...translated, [defaultLocale]: translated[defaultLocale] || source });
  const text = (field: "title" | "shortDescription" | "description") => withSource(values((item) => item[field]), field === "title" ? product?.title ?? "" : field === "shortDescription" ? product?.shortDescription ?? "" : product?.description ?? "");
  const seo = (field: "title" | "description") => withSource(values((item) => item.seo[field]), product?.seo?.[field] ?? "");
  const orderedLocales = [defaultLocale, ...localization.enabledLocales.filter((locale) => locale !== defaultLocale)];
  const completeness = (locale: T_Locale) => {
    const item = translations[locale] ?? (locale === defaultLocale && product ? getProductSourceTranslation(product) : createProductTranslation());
    const entries = [
      item.title,
      item.shortDescription,
      item.description,
      item.seo.title,
      item.seo.description,
      ...images.map((image) => item.imageAlts[image.id] ?? ""),
      ...attributes.flatMap((_, index) => [
        item.attributes[index]?.name ?? "",
        item.attributes[index]?.value ?? "",
      ]),
      ...variants.flatMap((variant) => [
        item.variants[variant.id]?.title ?? "",
        ...variant.attributes.flatMap((_, index) => [
          item.variants[variant.id]?.attributes[index]?.name ?? "",
          item.variants[variant.id]?.attributes[index]?.value ?? "",
        ]),
      ]),
    ];
    return Math.round(
      (entries.filter((value) => value.trim()).length / entries.length) * 100,
    );
  };
  const statuses = Object.fromEntries(orderedLocales.map((locale) => {
    if (locale === defaultLocale) return [locale, t("admin.product.translations.source")];
    const percentage = completeness(locale);
    return [locale, percentage === 0 ? t("admin.product.translations.empty") : percentage === 100 ? t("admin.product.translations.filled") : t("admin.product.translations.partial")];
  })) as Partial<Record<T_Locale, string>>;

  return <ProductFormSection title={t("admin.product.form.sections.translations")} {...sectionControl}>
    <TranslationStatusContext.Provider value={statuses}>
    <input type="hidden" name="defaultLocale" value={defaultLocale} />
    <input type="hidden" name="translations" value={JSON.stringify(translations)} />
    <input type="hidden" name="title" value={product?.title ?? ""} />
    <input type="hidden" name="shortDescription" value={product?.shortDescription ?? ""} />
    <input type="hidden" name="description" value={product?.description ?? ""} />
    <input type="hidden" name="seoTitle" value={product?.seo?.title ?? ""} />
    <input type="hidden" name="seoDescription" value={product?.seo?.description ?? ""} />
    <input type="hidden" name="seoKeywords" value={product?.seo?.keywords?.join(", ") ?? ""} />
    <p className="mb-4 text-sm text-muted">{t("admin.product.translations.description", { locale: defaultLocale.toUpperCase() })}</p>
    <div className="mb-4 grid gap-2 sm:grid-cols-3">
      {orderedLocales.map((locale) => <div key={locale} className="border border-border bg-background p-3"><div className="flex items-center justify-between gap-3 text-sm"><strong>{t(`language.${locale}`)}</strong><span>{completeness(locale)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full bg-accent" style={{ width: `${completeness(locale)}%` }} /></div></div>)}
    </div>
    <div className="space-y-4">
      <TranslationField label={t("admin.product.form.titleLabel")} defaultLocale={defaultLocale} values={text("title")} error={errors?.title} onChange={(locale, title) => patch(locale, { title })} />
      <TranslationField multiline label={t("admin.product.form.shortDescriptionLabel")} defaultLocale={defaultLocale} values={text("shortDescription")} onChange={(locale, shortDescription) => patch(locale, { shortDescription })} />
      <TranslationField multiline label={t("admin.product.form.descriptionLabel")} defaultLocale={defaultLocale} values={text("description")} error={errors?.description} onChange={(locale, description) => patch(locale, { description })} />
      <TranslationField label={t("admin.product.form.seoTitleLabel")} defaultLocale={defaultLocale} values={seo("title")} onChange={(locale, title) => patch(locale, { seo: { ...(translations[locale]?.seo ?? createProductTranslation().seo), title } })} />
      <TranslationField multiline label={t("admin.product.form.seoDescriptionLabel")} defaultLocale={defaultLocale} values={seo("description")} onChange={(locale, description) => patch(locale, { seo: { ...(translations[locale]?.seo ?? createProductTranslation().seo), description } })} />
      <TranslationField label={t("admin.product.form.seoKeywordsLabel")} defaultLocale={defaultLocale} values={withSource(values((item) => item.seo.keywords.join(", ")), product?.seo?.keywords?.join(", ") ?? "")} onChange={(locale, value) => patch(locale, { seo: { ...(translations[locale]?.seo ?? createProductTranslation().seo), keywords: value.split(",").map((keyword) => keyword.trim()).filter(Boolean) } })} />

      {images.map((image, index) => <TranslationField key={image.id} label={t("admin.product.translations.imageAlt", { index: index + 1 })} defaultLocale={defaultLocale} values={withSource(values((item) => item.imageAlts[image.id] ?? ""), image.alt ?? "")} onChange={(locale, alt) => patch(locale, { imageAlts: { ...(translations[locale]?.imageAlts ?? {}), [image.id]: alt } })} />)}

      {attributes.map((attribute, index) => <div key={`${attribute.name}-${index}`} className="space-y-3 border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">{t("admin.product.translations.attribute", { name: attribute.name || String(index + 1) })}</p>
        <TranslationField label={t("admin.product.form.attributesNamePlaceholder")} defaultLocale={defaultLocale} values={withSource(values((item) => item.attributes.find((entry) => entry.sourceId === attribute.id)?.name ?? item.attributes[index]?.name ?? ""), attribute.name)} onChange={(locale, name) => patchAttribute(locale, index, attribute.id, { name }, translations, patch)} />
        <TranslationField label={t("admin.product.form.attributesValuePlaceholder")} defaultLocale={defaultLocale} values={withSource(values((item) => item.attributes.find((entry) => entry.sourceId === attribute.id)?.value ?? item.attributes[index]?.value ?? ""), attribute.value)} onChange={(locale, value) => patchAttribute(locale, index, attribute.id, { value }, translations, patch)} />
      </div>)}

      {variants.map((variant) => <div key={variant.id} className="space-y-3 border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">{t("admin.product.translations.variant", { name: variant.title || variant.sku })}</p>
        <TranslationField label={t("admin.product.form.variantTitlePlaceholder")} defaultLocale={defaultLocale} values={withSource(values((item) => item.variants[variant.id]?.title ?? ""), variant.title)} onChange={(locale, title) => patchVariant(locale, variant, { title }, translations, patch)} />
        {variant.attributes.map((attribute, index) => <div key={`${variant.id}-${index}`} className="space-y-3">
          <TranslationField label={`${attribute.name} - ${t("admin.product.form.attributesNamePlaceholder")}`} defaultLocale={defaultLocale} values={withSource(values((item) => item.variants[variant.id]?.attributes.find((entry) => entry.sourceId === attribute.id)?.name ?? item.variants[variant.id]?.attributes[index]?.name ?? ""), attribute.name)} onChange={(locale, name) => patchVariantAttribute(locale, variant, index, { name }, translations, patch)} />
          <TranslationField label={`${attribute.value} - ${t("admin.product.form.attributesValuePlaceholder")}`} defaultLocale={defaultLocale} values={withSource(values((item) => item.variants[variant.id]?.attributes.find((entry) => entry.sourceId === attribute.id)?.value ?? item.variants[variant.id]?.attributes[index]?.value ?? ""), attribute.value)} onChange={(locale, value) => patchVariantAttribute(locale, variant, index, { value }, translations, patch)} />
        </div>)}
      </div>)}
    </div>
    </TranslationStatusContext.Provider>
  </ProductFormSection>;
};

const currentValue = (translation: T_ProductTranslation | undefined, read: (translation: T_ProductTranslation) => string) => translation ? read(translation) : "";
const patchAttribute = (locale: T_Locale, index: number, sourceId: string | undefined, changes: Partial<T_ProductAttribute>, translations: Partial<Record<T_Locale, T_ProductTranslation>>, patch: (locale: T_Locale, changes: Partial<T_ProductTranslation>) => void) => {
  const items = [...(translations[locale]?.attributes ?? [])];
  items[index] = { sourceId, name: items[index]?.name ?? "", value: items[index]?.value ?? "", ...changes };
  patch(locale, { attributes: items });
};
const patchVariant = (locale: T_Locale, variant: T_ProductVariant, changes: { title?: string }, translations: Partial<Record<T_Locale, T_ProductTranslation>>, patch: (locale: T_Locale, changes: Partial<T_ProductTranslation>) => void) => {
  const variants = translations[locale]?.variants ?? {};
  patch(locale, { variants: { ...variants, [variant.id]: { title: variants[variant.id]?.title ?? "", attributes: variants[variant.id]?.attributes ?? [], ...changes } } });
};
const patchVariantAttribute = (locale: T_Locale, variant: T_ProductVariant, index: number, changes: Partial<T_ProductAttribute>, translations: Partial<Record<T_Locale, T_ProductTranslation>>, patch: (locale: T_Locale, changes: Partial<T_ProductTranslation>) => void) => {
  const current = translations[locale]?.variants[variant.id];
  const attributes = [...(current?.attributes ?? [])];
  attributes[index] = { sourceId: variant.attributes[index]?.id, name: attributes[index]?.name ?? "", value: attributes[index]?.value ?? "", ...changes };
  patch(locale, { variants: { ...(translations[locale]?.variants ?? {}), [variant.id]: { title: current?.title ?? "", attributes } } });
};
