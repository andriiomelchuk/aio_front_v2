import { Button } from "@/shared/ui";
import { HeartIcon } from "@/components/Products/icons";
import { useWishlist } from "../../model/useWishlist";
import { T_Product } from "@/entities/product/model/types";
import { useI18n } from "@/shared/i18n";

export const AddToWishlistButton = ({ product }: { product: T_Product }) => {
  const { t } = useI18n();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  
  const isActive = isInWishlist(product.id);

  const handleWishlistClick = () => {
    if (isActive) {
      removeFromWishlist(product);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center px-0"
      aria-label={t("products.addToWishlist")}
      onClick={handleWishlistClick}
    >
      <HeartIcon filled={isActive}/>
    </Button>
  );
};
