import { useI18n } from "@/shared/i18n";
import { Input } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductShippingSection = ({ product }: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.shipping")}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          label={t("admin.product.form.weightLabel")}
          name="weight"
          type="number"
          min="0"
          step="0.01"
          defaultValue={product?.shipping?.weight ?? ""}
          placeholder={t("admin.product.form.weightPlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.widthLabel")}
          name="width"
          type="number"
          min="0"
          step="0.01"
          defaultValue={product?.shipping?.width ?? ""}
          placeholder={t("admin.product.form.widthPlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.heightLabel")}
          name="height"
          type="number"
          min="0"
          step="0.01"
          defaultValue={product?.shipping?.height ?? ""}
          placeholder={t("admin.product.form.heightPlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.depthLabel")}
          name="depth"
          type="number"
          min="0"
          step="0.01"
          defaultValue={product?.shipping?.depth ?? ""}
          placeholder={t("admin.product.form.depthPlaceholder")}
          className="h-10 w-full"
        />
      </div>
    </ProductFormSection>
  );
};
