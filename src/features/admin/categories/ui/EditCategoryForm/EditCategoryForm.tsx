"use client";

import { SyntheticEvent, useState } from "react";

import { useI18n } from "@/shared/i18n";
import { Input, Select } from "@/shared/ui";

import type { T_EditCategoryData, T_EditCategoryFormProps } from "./types";
import { CategoriesApiError, updateCategory } from "@/shared/api/categories";
import { AdminFormActions, AdminFormAlert } from "@/widgets/AdminWidgets";

export const EditCategoryForm = ({
  category,
  onCancel,
  onUpdate,
}: T_EditCategoryFormProps) => {
  const { t } = useI18n();

  const [formData, setFormData] = useState<T_EditCategoryData>({
    id: category.slug,
    name: category.name,
    slug: category.slug,
    status: category.status,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof T_EditCategoryData, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
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
        <Input
          label={t("admin.category.form.nameLabel")}
          name="name"
          value={formData.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder={t("admin.category.form.namePlaceholder")}
          className="h-10 w-full"
          type="text"
          required
        />

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
