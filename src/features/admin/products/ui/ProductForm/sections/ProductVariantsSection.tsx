import { useI18n } from "@/shared/i18n";
import { ProductVariantsManager } from "../../ProductVariantsManager";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductVariantsSection = ({
  product,
  sectionControl,
}: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection
      title={t("admin.product.form.sections.variants")}
      {...sectionControl}
    >
      <ProductVariantsManager variants={product?.variants} />
    </ProductFormSection>
  );
};
