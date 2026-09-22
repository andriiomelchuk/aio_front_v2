import { SyntheticEvent, useState } from "react";
import type { T_AddCategoryFormProps, T_CategoryData } from "./types";
import { Input, Select } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { CategoriesApiError, createCategory } from "@/shared/api/categories";
import { AdminFormActions, AdminFormAlert } from "@/widgets/AdminWidgets";

export const AddCategoryForm = ({ onCancel, onCreate }: T_AddCategoryFormProps) => {
  const { t } = useI18n();
  const [category, setCategory] = useState<T_CategoryData>({
    name: "",
    slug: "",
    status: "inactive",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateCategory = (field: keyof T_CategoryData, value: string) => {
    setCategory((prevCategory) => ({
      ...prevCategory,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsSaving(true);

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

      <AdminFormActions cancelLabel={t("admin.actions.cancel")} submitLabel={t("admin.actions.createCategory")} submittingLabel={t("admin.form.saving")} isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};
