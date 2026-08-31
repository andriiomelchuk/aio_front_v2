import { useI18n } from "@/shared/i18n";
import { Textarea } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductDescriptionSection = ({
  product,
}: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.description")}>
      <div className="grid gap-4">
        <Textarea
          label={t("admin.product.form.shortDescriptionLabel")}
          name="shortDescription"
          defaultValue={product?.shortDescription ?? ""}
          placeholder={t("admin.product.form.shortDescriptionPlaceholder")}
        />

        <Textarea
          label={t("admin.product.form.descriptionLabel")}
          name="description"
          defaultValue={product?.description ?? ""}
          placeholder={t("admin.product.form.descriptionPlaceholder")}
          className="min-h-40"
        />
      </div>
    </ProductFormSection>
  );
};
