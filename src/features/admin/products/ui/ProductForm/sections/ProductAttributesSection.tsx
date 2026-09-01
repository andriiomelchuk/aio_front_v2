import { useI18n } from "@/shared/i18n";
import { ProductAttributesManager } from "../../ProductAttributesManager";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductAttributesSection = ({
  product,
  sectionControl,
}: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection
      title={t("admin.product.form.sections.attributes")}
      {...sectionControl}
    >
      <ProductAttributesManager attributes={product?.attributes} />
    </ProductFormSection>
  );
};
