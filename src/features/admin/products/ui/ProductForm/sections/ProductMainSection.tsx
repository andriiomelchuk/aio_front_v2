import { useI18n } from "@/shared/i18n";
import { Input, Select } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductMainSectionProps } from "./types";

export const ProductMainSection = ({
  product,
  isEditMode,
}: T_ProductMainSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.main")}>
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
          label={t("admin.product.form.titleLabel")}
          name="title"
          type="text"
          defaultValue={product?.title ?? ""}
          placeholder={t("admin.product.form.titlePlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.slugLabel")}
          name="slug"
          type="text"
          defaultValue={product?.slug ?? ""}
          placeholder={t("admin.product.form.slugPlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.skuLabel")}
          name="sku"
          type="text"
          defaultValue={product?.sku ?? ""}
          placeholder={t("admin.product.form.skuPlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.brandLabel")}
          name="brand"
          type="text"
          defaultValue={product?.brand ?? ""}
          placeholder={t("admin.product.form.brandPlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.categoryLabel")}
          name="categoryId"
          type="text"
          defaultValue={product?.categoryId ?? ""}
          placeholder={t("admin.product.form.categoryPlaceholder")}
          className="h-10 w-full"
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
