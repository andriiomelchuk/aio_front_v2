"use client";
import { Button, useToast } from "@/shared/ui";
import { HeartIcon } from "@/components/Products/icons";
import { useWishlist } from "../../model/useWishlist";
import type { T_Product } from "@/entities/product/model/types";
import { useI18n } from "@/shared/i18n";



export const AddToWishlistButton = ({ product }: { product: T_Product }) => {

  const { t } = useI18n();
  const { isInWishlist, toggleProductWishlist } = useWishlist();
  const { showToast } = useToast();

  
  const isActive = isInWishlist(product.id);

  const handleToggleWishlist = () => {
    toggleProductWishlist(product.id);
    showToast({
      message: isActive
        ? t("notifications.wishlist.removed")
        : t("notifications.wishlist.added"),
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
          ? t("notifications.wishlist.removeAction")
          : t("products.addToWishlist")
      }
      onClick={handleToggleWishlist}
    >
      <HeartIcon filled={isActive}/>
    </Button>
  );
};
