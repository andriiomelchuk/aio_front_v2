"use client";

import { SyntheticEvent, useState } from "react";

import { useI18n } from "@/shared/i18n";
import { Button, Input, Select } from "@/shared/ui";

import type { T_EditCategoryData, T_EditCategoryFormProps } from "./types";
import { updateCategory } from "@/shared/api/categories";

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

  const updateField = (field: keyof T_EditCategoryData, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updatedCategory = await updateCategory({
      ...category,
      ...formData,
      id: formData.slug
    });

    onUpdate(updatedCategory);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="h-10 w-full sm:w-auto"
          onClick={onCancel}
        >
          {t("admin.actions.cancel")}
        </Button>

        <Button type="submit" variant="default" className="h-10 w-full sm:w-auto">
          {t("admin.actions.saveChanges")}
        </Button>
      </div>
    </form>
  );
};
