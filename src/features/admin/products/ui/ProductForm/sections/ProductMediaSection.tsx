import { useI18n } from "@/shared/i18n";
import { ProductFormSection } from "../ProductFormSection";
import { ProductGalleryManager } from "../../ProductGalleryManager";
import type { T_ProductSectionProps } from "./types";

export const ProductMediaSection = ({
  product,
  sectionControl,
}: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection
      title={t("admin.product.form.sections.media")}
      {...sectionControl}
    >
      <ProductGalleryManager
        images={product?.images}
        thumbnail={product?.thumbnail}
      />
    </ProductFormSection>
  );
};
