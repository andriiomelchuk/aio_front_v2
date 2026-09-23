"use client";

import { SyntheticEvent, useState } from "react";

import { useI18n } from "@/shared/i18n";
import { Input, Select } from "@/shared/ui";

import type { T_EditCategoryData, T_EditCategoryFormProps } from "./types";
import { CategoriesApiError, updateCategory } from "@/shared/api/categories";
import { AdminFormActions, AdminFormAlert } from "@/widgets/AdminWidgets";
import { createCategoryTranslation, normalizeCategoryTranslations, type T_CategoryTranslation } from "@/entities/categories";
import { useSiteSettings } from "@/shared/siteSettings";
import type { T_Locale } from "@/shared/i18n";
import { CategoryTranslationFields } from "../CategoryTranslationFields";

export const EditCategoryForm = ({
  category,
  onCancel,
  onUpdate,
}: T_EditCategoryFormProps) => {
  const { t } = useI18n();
  const { localization } = useSiteSettings();
  const defaultLocale = category.defaultLocale ?? localization.defaultLocale;
  const initialTranslations = normalizeCategoryTranslations(category.translations);

  const [formData, setFormData] = useState<T_EditCategoryData>({
    id: category.slug,
    name: category.name,
    description: category.description ?? "",
    slug: category.slug,
    status: category.status,
    defaultLocale,
    translations: {
      ...initialTranslations,
      [defaultLocale]: initialTranslations[defaultLocale] ?? {
        name: category.name,
        description: category.description ?? "",
      },
    },
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof T_EditCategoryData, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const updateTranslation = (locale: T_Locale, field: keyof T_CategoryTranslation, value: string) => {
    setFormData((current) => {
      const translation = current.translations[locale] ?? createCategoryTranslation();
      return {
        ...current,
        ...(locale === current.defaultLocale ? { [field]: value } : {}),
        translations: {
          ...current.translations,
          [locale]: { ...translation, [field]: value },
        },
      };
    });
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    try {
      const updatedCategory = await updateCategory({
        ...category,
        ...formData,
        id: category.id,
      });

      onUpdate(updatedCategory);
    } catch (caughtError) {
      setError(
        caughtError instanceof CategoriesApiError && caughtError.code === "DUPLICATE_SLUG"
          ? t("admin.category.error.duplicateSlug")
          : t("admin.category.error.saveFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormAlert message={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <CategoryTranslationFields defaultLocale={formData.defaultLocale} values={formData.translations} onChange={updateTranslation} />

        <Input
          label={t("admin.category.form.slugLabel")}
          name="slug"
          value={formData.slug}
          onChange={(event) => updateField("slug", event.target.value)}
          placeholder={t("admin.category.form.slugPlaceholder")}
          className="h-10 w-full"
          type="text"
          required
        />

        <Select
          label={t("admin.category.form.statusLabel")}
          name="status"
          required
          value={formData.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={[
            { value: "active", label: t("admin.categories.status.active") },
            { value: "inactive", label: t("admin.categories.status.inactive") },
          ]}
        />
      </div>

      <AdminFormActions cancelLabel={t("admin.actions.cancel")} submitLabel={t("admin.actions.saveChanges")} submittingLabel={t("admin.form.saving")} isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};
