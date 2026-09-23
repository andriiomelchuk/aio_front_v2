"use client";

import { useState } from "react";
import type { T_CategoryTranslation } from "@/entities/categories";
import { useI18n, type T_Locale } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";
import { Input, Select, Textarea } from "@/shared/ui";

type T_CategoryTranslationFieldsProps = {
  defaultLocale: T_Locale;
  values: Partial<Record<T_Locale, T_CategoryTranslation>>;
  onChange: (locale: T_Locale, field: keyof T_CategoryTranslation, value: string) => void;
};

export const CategoryTranslationFields = ({
  defaultLocale,
  values,
  onChange,
}: T_CategoryTranslationFieldsProps) => {
  const { t } = useI18n();
  const { localization } = useSiteSettings();
  const [nameLocale, setNameLocale] = useState(defaultLocale);
  const [descriptionLocale, setDescriptionLocale] = useState(defaultLocale);
  const localeOptions = [
    defaultLocale,
    ...localization.enabledLocales.filter((locale) => locale !== defaultLocale),
  ].map((locale) => ({
    value: locale,
    label: `${t(`language.${locale}`)}${values[locale]?.name.trim() ? " +" : ""}`,
  }));

  return (
    <div className="grid gap-4 sm:col-span-2">
      <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end">
        <Select
          label={t("admin.category.form.languageLabel")}
          value={nameLocale}
          onChange={(event) => setNameLocale(event.target.value as T_Locale)}
          options={localeOptions}
        />
        <Input
          label={t("admin.category.form.nameLabel")}
          name={nameLocale === defaultLocale ? "name" : undefined}
          value={values[nameLocale]?.name ?? ""}
          onChange={(event) => onChange(nameLocale, "name", event.target.value)}
          placeholder={t("admin.category.form.namePlaceholder")}
          className="h-10 w-full"
          type="text"
          required={nameLocale === defaultLocale}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end">
        <Select
          label={t("admin.category.form.languageLabel")}
          value={descriptionLocale}
          onChange={(event) => setDescriptionLocale(event.target.value as T_Locale)}
          options={localeOptions}
        />
        <Textarea
          label={t("admin.category.form.descriptionLabel")}
          value={values[descriptionLocale]?.description ?? ""}
          onChange={(event) => onChange(descriptionLocale, "description", event.target.value)}
          placeholder={t("admin.category.form.descriptionPlaceholder")}
          rows={3}
        />
      </div>
    </div>
  );
};
