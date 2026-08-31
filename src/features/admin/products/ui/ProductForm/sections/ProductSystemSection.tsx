import { useI18n } from "@/shared/i18n";
import { Input } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

export const ProductSystemSection = ({ product }: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.system")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t("admin.product.form.createdAtLabel")}
          name="createdAt"
          type="text"
          defaultValue={product?.createdAt ?? ""}
          className="h-10 w-full"
          disabled
        />

        <Input
          label={t("admin.product.form.updatedAtLabel")}
          name="updatedAt"
          type="text"
          defaultValue={product?.updatedAt ?? ""}
          className="h-10 w-full"
          disabled
        />
      </div>
    </ProductFormSection>
  );
};
