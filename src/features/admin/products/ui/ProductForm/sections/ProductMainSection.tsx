import { useEffect, useState } from "react";
import type { T_Categories } from "@/entities/categories/model/types";
import { getCategories } from "@/shared/api/categories";
import { useI18n } from "@/shared/i18n";
import { Input, Select } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductMainSectionProps } from "./types";

export const ProductMainSection = ({
  product,
  isEditMode,
  errors,
  sectionControl,
}: T_ProductMainSectionProps) => {
  const { t } = useI18n();
  const [categories, setCategories] = useState<T_Categories[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const categories = await getCategories();

        if (isMounted) {
          setCategories(categories);
        }
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = [
    {
      value: "",
      label: t("admin.product.form.categoryPlaceholder"),
    },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  return (
    <ProductFormSection
      title={t("admin.product.form.sections.main")}
      {...sectionControl}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {isEditMode && (
          <Input
            label={t("admin.product.form.idLabel")}
            name="id"
            type="text"
            defaultValue={product?.id ?? ""}
            className="h-10 w-full"
            disabled
          />
        )}

        <Input
          label={t("admin.product.form.slugLabel")}
          name="slug"
          type="text"
          defaultValue={product?.slug ?? ""}
          placeholder={t("admin.product.form.slugPlaceholder")}
          className="h-10 w-full"
          error={errors?.slug}
        />

        <Input
          label={t("admin.product.form.skuLabel")}
          name="sku"
          type="text"
          defaultValue={product?.sku ?? ""}
          placeholder={t("admin.product.form.skuPlaceholder")}
          className="h-10 w-full"
          error={errors?.sku}
        />

        <Input
          label={t("admin.product.form.brandLabel")}
          name="brand"
          type="text"
          defaultValue={product?.brand ?? ""}
          placeholder={t("admin.product.form.brandPlaceholder")}
          className="h-10 w-full"
        />

        <Select
          label={t("admin.product.form.categoryLabel")}
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          options={categoryOptions}
          className="h-10 w-full"
          error={errors?.categoryId}
        />

        <Select
          label={t("admin.product.form.statusLabel")}
          name="status"
          defaultValue={product?.status ?? "draft"}
          options={[
            { value: "draft", label: t("admin.products.status.draft") },
            { value: "active", label: t("admin.products.status.active") },
            { value: "archived", label: t("admin.products.status.archived") },
          ]}
        />
      </div>
    </ProductFormSection>
  );
};
