import Image from "next/image";
import type { T_CartItem } from "@/features/cart";
import { useLocalizedProduct } from "@/features/catalog";
import { useCart } from "@/features/cart/model/useCart";
import { useI18n } from "@/shared/i18n";
import { usePriceFormatter } from "@/shared/siteSettings";
import { Button } from "@/shared/ui";
import { useSiteSettings } from "@/shared/siteSettings";

export const CartItem = ({ item }: { item: T_CartItem }) => {
  const { t } = useI18n();
  const formatPrice = usePriceFormatter();
  const settings = useSiteSettings();
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const product = useLocalizedProduct(item.product);

  const finalPrice = item.product.discountPercentage
    ? item.product.price -
      (item.product.price * item.product.discountPercentage) / 100
    : item.product.price;

  const basePrice = item.product.oldPrice ?? item.product.price;

  const hasDiscount = Boolean(item.product.discountPercentage);

  const mainImage =
    item.product.images.find((image) => image.isMain)?.url ??
    item.product.thumbnail;

  return (
    <article className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_120px_130px_120px_44px] md:items-center md:gap-4">
      <div className="flex min-w-0 gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-surface-muted sm:h-28 sm:w-28 md:h-20 md:w-20">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0">
          <h2 className="line-clamp-2 text-base font-semibold text-foreground">
            {product.title}
          </h2>
          <p className="mt-1 text-sm text-muted">{item.product.brand}</p>
          <p className="mt-2 text-xs text-muted">SKU: {item.product.sku}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 md:block md:text-right">
        <span className="text-sm text-muted md:hidden">
          {t("cart.table.basePrice")}
        </span>
        <div>
          <div className="font-semibold text-foreground">
            {formatPrice(basePrice, item.product.currency)}
          </div>

          {hasDiscount && (
            <div className="mt-1 text-sm font-semibold text-accent">
              -{item.product.discountPercentage}%
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 md:block md:text-center">
        <span className="text-sm text-muted md:hidden">
          {t("cart.table.quantity")}
        </span>
        <div className="flex flex-col items-end md:items-center">
          <div className="flex h-10 overflow-hidden rounded-md border border-border">
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 text-foreground transition hover:bg-surface-muted"
              onClick={() => decreaseQuantity(item.product)}
            >
              -
            </Button>
            <span className="flex h-10 min-w-12 items-center justify-center border-x border-border px-3 font-semibold">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 text-foreground transition hover:bg-surface-muted"
              onClick={() => increaseQuantity(item.product)}
              disabled={!settings.commerce.allowBackorders && item.quantity >= item.product.stockQuantity}
            >
              +
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">
            {t("cart.item.maxAvailable", {
              count: item.product.stockQuantity,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 md:block md:text-right">
        <span className="text-sm text-muted md:hidden">
          {t("cart.table.total")}
        </span>
        <span className="font-bold text-foreground">
          {formatPrice(finalPrice * item.quantity, item.product.currency)}
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="flex h-10 w-full items-center justify-center rounded-md border border-border text-sm text-muted transition hover:border-danger hover:text-danger md:w-10"
        aria-label={t("cart.table.remove")}
        onClick={() => removeFromCart(item.product)}
      >
        X
      </Button>
    </article>
  );
};
