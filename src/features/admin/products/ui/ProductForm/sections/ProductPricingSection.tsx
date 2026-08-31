import { useI18n } from "@/shared/i18n";
import { Input, Select } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_ProductSectionProps } from "./types";

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "UAH", label: "UAH" },
];

export const ProductPricingSection = ({ product }: T_ProductSectionProps) => {
  const { t } = useI18n();

  return (
    <ProductFormSection title={t("admin.product.form.sections.pricing")}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          label={t("admin.product.form.priceLabel")}
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={product?.price ?? ""}
          placeholder={t("admin.product.form.pricePlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.oldPriceLabel")}
          name="oldPrice"
          type="number"
          min="0"
          step="0.01"
          defaultValue={product?.oldPrice ?? ""}
          placeholder={t("admin.product.form.oldPricePlaceholder")}
          className="h-10 w-full"
        />

        <Input
          label={t("admin.product.form.discountLabel")}
          name="discountPercentage"
          type="number"
          min="0"
          max="100"
          step="0.01"
          defaultValue={product?.discountPercentage ?? ""}
          placeholder={t("admin.product.form.discountPlaceholder")}
          className="h-10 w-full"
        />

        <Select
          label={t("admin.product.form.currencyLabel")}
          name="currency"
          defaultValue={product?.currency ?? "USD"}
          options={currencyOptions}
        />
      </div>
    </ProductFormSection>
  );
};
