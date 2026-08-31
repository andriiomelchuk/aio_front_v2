import { useI18n } from "@/shared/i18n";
import { Textarea } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductAttributesSection = ({
  product,
}: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.attributes")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          label={t("admin.product.form.attributesLabel")}
          name="attributes"
          defaultValue={
            product?.attributes
              .map((attribute) => `${attribute.name}: ${attribute.value}`)
              .join("\n") ?? ""
          }
          placeholder={t("admin.product.form.attributesPlaceholder")}
        />

        <Textarea
          label={t("admin.product.form.variantsLabel")}
          name="variants"
          defaultValue={
            product?.variants
              ?.map((variant) => `${variant.title} | ${variant.sku}`)
              .join("\n") ?? ""
          }
          placeholder={t("admin.product.form.variantsPlaceholder")}
        />
      </div>
    </ProductFormSection>
  );
};
