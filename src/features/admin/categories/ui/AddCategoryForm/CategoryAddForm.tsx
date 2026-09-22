import { SyntheticEvent, useState } from "react";
import type { T_AddCategoryFormProps, T_CategoryData } from "./types";
import { Input, Select } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { CategoriesApiError, createCategory } from "@/shared/api/categories";
import { AdminFormActions, AdminFormAlert } from "@/widgets/AdminWidgets";
import { createCategoryTranslation, type T_CategoryTranslation } from "@/entities/categories";
import { useSiteSettings } from "@/shared/siteSettings";
import type { T_Locale } from "@/shared/i18n";
import { CategoryTranslationFields } from "../CategoryTranslationFields";

export const AddCategoryForm = ({ onCancel, onCreate }: T_AddCategoryFormProps) => {
  const { t } = useI18n();
  const { localization } = useSiteSettings();
  const [category, setCategory] = useState<T_CategoryData>({
    name: "",
    description: "",
    slug: "",
    status: "inactive",
    defaultLocale: localization.defaultLocale,
    translations: {},
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateCategory = (field: keyof T_CategoryData, value: string) => {
    setCategory((prevCategory) => ({
      ...prevCategory,
      [field]: value,
    }));
  };

  const updateTranslation = (locale: T_Locale, field: keyof T_CategoryTranslation, value: string) => {
    setCategory((current) => {
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
      const createdCategory = await createCategory({
        name: category.name,
        description: category.description,
        slug: category.slug,
        status: category.status,
        defaultLocale: category.defaultLocale,
        translations: category.translations,
      });
      onCreate(createdCategory);
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
        <CategoryTranslationFields defaultLocale={category.defaultLocale} values={category.translations} onChange={updateTranslation} />

        <Input
          label={t("admin.category.form.slugLabel")}
          name="slug"
          type="text"
          value={category.slug}
          onChange={(event) => updateCategory("slug", event.target.value)}
          placeholder={t("admin.category.form.slugPlaceholder")}
          className="h-10 w-full"
          required
        />

        <Select
          label={t("admin.category.form.statusLabel")}
          name="status"
          required
          value={category.status}
          onChange={(event) => updateCategory("status", event.target.value)}
          options={[
            { value: "active", label: t("admin.categories.status.active") },
            { value: "inactive", label: t("admin.categories.status.inactive") },

          ]}
        />
      </div>

      <AdminFormActions cancelLabel={t("admin.actions.cancel")} submitLabel={t("admin.actions.createCategory")} submittingLabel={t("admin.form.saving")} isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};
