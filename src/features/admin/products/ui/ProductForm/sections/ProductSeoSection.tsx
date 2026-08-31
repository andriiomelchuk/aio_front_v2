import { useI18n } from "@/shared/i18n";
import { Input, Textarea } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductSeoSection = ({ product }: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.seo")}>
      <div className="grid gap-4">
        <Input
          label={t("admin.product.form.seoTitleLabel")}
          name="seoTitle"
          type="text"
          defaultValue={product?.seo?.title ?? ""}
          placeholder={t("admin.product.form.seoTitlePlaceholder")}
          className="h-10 w-full"
        />

        <Textarea
          label={t("admin.product.form.seoDescriptionLabel")}
          name="seoDescription"
          defaultValue={product?.seo?.description ?? ""}
          placeholder={t("admin.product.form.seoDescriptionPlaceholder")}
        />

        <Input
          label={t("admin.product.form.seoKeywordsLabel")}
          name="seoKeywords"
          type="text"
          defaultValue={product?.seo?.keywords?.join(", ") ?? ""}
          placeholder={t("admin.product.form.seoKeywordsPlaceholder")}
          className="h-10 w-full"
        />
      </div>
    </ProductFormSection>
  );
};
