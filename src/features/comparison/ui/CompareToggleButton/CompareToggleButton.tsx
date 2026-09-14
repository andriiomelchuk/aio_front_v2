"use client";
import { Button, useToast } from "@/shared/ui";
import { useCompare } from "../../model/useCompare";
import { useI18n } from "@/shared/i18n";
import type { T_Product } from "@/entities/product/model/types";
import { CompareIcon } from "@/components/Products/icons";

export const CompareToggleButton = ({ product }: { product: T_Product }) => {
  const { t } = useI18n();
  const { isInCompare, toggleProductInCompare } = useCompare();
  const { showToast } = useToast();
  const isActive  = isInCompare(product.id);

  const handleToggleComparison = () => {
    toggleProductInCompare(product);
    showToast({
      message: isActive
        ? t("notifications.comparison.removed")
        : t("notifications.comparison.added"),
      variant: isActive ? "info" : "success",
    });
  };



  return (
    <Button
      type="button"
      variant="secondary"
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center px-0"
      aria-label={
        isActive
          ? t("notifications.comparison.removeAction")
          : t("products.forComparison")
      }
      onClick={handleToggleComparison}
    >
      <CompareIcon filled={isActive}/>
    </Button>
  );
};
