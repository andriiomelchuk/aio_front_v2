"use client";
import { Button } from "@/shared/ui";
import { HeartIcon } from "@/components/Products/icons";
import { useWishlist } from "../../model/useWishlist";
import type { T_Product } from "@/entities/product/model/types";
import { useI18n } from "@/shared/i18n";



export const AddToWishlistButton = ({ product }: { product: T_Product }) => {

  const { t } = useI18n();
  const { isInWishlist, toggleProductWishlist } = useWishlist();

  
  const isActive = isInWishlist(product.id);


  return (
    <Button
      type="button"
      variant="secondary"
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center px-0"
      aria-label={t("products.addToWishlist")}
      onClick={() => toggleProductWishlist(product.id)}
    >
      <HeartIcon filled={isActive}/>
    </Button>
  );
};
