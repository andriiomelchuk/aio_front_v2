"use client";
import { Button } from "@/shared/ui";
import { useCompare } from "../../model/useCompare";
import { useI18n } from "@/shared/i18n";
import type { T_Product } from "@/entities/product/model/types";
import { CompareIcon } from "@/components/Products/icons";

export const CompareToggleButton = ({ product }: { product: T_Product }) => {
  const { t } = useI18n();
  const { isInCompare, toggleProductInCompare } = useCompare();
  const isActive  = isInCompare(product.id);



  return (
    <Button
      type="button"
      variant="secondary"
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center px-0"
      aria-label={t("products.forComparison")}
      onClick={() => toggleProductInCompare(product)}
    >
      <CompareIcon filled={isActive}/>
    </Button>
  );
};
