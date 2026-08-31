import { useI18n } from "@/shared/i18n";
import { Input, Textarea } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductMediaSection = ({ product }: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.media")}>
      <div className="grid gap-4">
        <Input
          label={t("admin.product.form.thumbnailLabel")}
          name="thumbnail"
          type="url"
          defaultValue={product?.thumbnail ?? ""}
          placeholder={t("admin.product.form.thumbnailPlaceholder")}
          className="h-10 w-full"
        />

        <Textarea
          label={t("admin.product.form.imagesLabel")}
          name="images"
          defaultValue={product?.images.map((image) => image.url).join("\n") ?? ""}
          placeholder={t("admin.product.form.imagesPlaceholder")}
          className="min-h-32"
        />
      </div>
    </ProductFormSection>
  );
};
