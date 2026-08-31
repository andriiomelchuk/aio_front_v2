import { useI18n } from "@/shared/i18n";
import { Input, Select } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductStockSection = ({ product }: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.stock")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t("admin.product.form.stockQuantityLabel")}
          name="stockQuantity"
          type="number"
          min="0"
          defaultValue={product?.stockQuantity ?? ""}
          placeholder={t("admin.product.form.stockQuantityPlaceholder")}
          className="h-10 w-full"
        />

        <Select
          label={t("admin.product.form.stockStatusLabel")}
          name="stockStatus"
          defaultValue={product?.stockStatus ?? "out_of_stock"}
          options={[
            { value: "in_stock", label: t("admin.products.stock.inStock") },
            { value: "low_stock", label: t("admin.products.stock.lowStock") },
            {
              value: "out_of_stock",
              label: t("admin.products.stock.outOfStock"),
            },
          ]}
        />
      </div>
    </ProductFormSection>
  );
};
