import { SyntheticEvent, useState } from "react";
import type { T_AddCategoryFormProps, T_CategoryData } from "./types";
import { Button, Input, Select } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { CategoriesApiError, createCategory } from "@/shared/api/categories";

export const AddCategoryForm = ({ onCancel, onCreate }: T_AddCategoryFormProps) => {
  const { t } = useI18n();
  const [category, setCategory] = useState<T_CategoryData>({
    name: "",
    slug: "",
    status: "inactive",
  });
  const [error, setError] = useState("");

  const updateCategory = (field: keyof T_CategoryData, value: string) => {
    setCategory((prevCategory) => ({
      ...prevCategory,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    try {
      const createdCategory = await createCategory({
        name: category.name,
        slug: category.slug,
        status: category.status,
      });
      onCreate(createdCategory);
    } catch (caughtError) {
      setError(
        caughtError instanceof CategoriesApiError && caughtError.code === "DUPLICATE_SLUG"
          ? t("admin.category.error.duplicateSlug")
          : t("admin.category.error.saveFailed"),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t("admin.category.form.nameLabel")}
          name="name"
          value={category.name}
          onChange={(event) => updateCategory("name", event.target.value)}
          placeholder={t("admin.category.form.namePlaceholder")}
          className="h-10 w-full"
          type="text"
          required
        />

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
          {t("admin.actions.createCategory")}
        </Button>
      </div>
    </form>
  );
};
