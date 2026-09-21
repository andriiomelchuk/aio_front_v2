import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/features/cart";
import { canPurchaseProduct, useLocalizedProduct } from "@/features/catalog";
import { useCompare } from "@/features/comparison/model/useCompare";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { usePriceFormatter } from "@/shared/siteSettings";
import { useSiteSettings } from "@/shared/siteSettings";
import { T_ComparisonItemProps } from "./types";




export const ComparisonItem = ({product, priceCalc}: T_ComparisonItemProps) => {

  const { t } = useI18n();
  const formatPrice = usePriceFormatter();
  const settings = useSiteSettings();
  const { toggleProductInCompare } = useCompare();
  const localizedProduct = useLocalizedProduct(product);
  const mainImage =
    product.images.find((image) => image.isMain)?.url ?? product.thumbnail;
  const finalPrice = priceCalc(
    product.price,
    product.discountPercentage,
  );
  const isAvailable = canPurchaseProduct(product, settings.commerce.allowBackorders);

  return (
    <article
      key={product.id}
      className="overflow-hidden rounded-lg border border-border bg-surface"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-surface-muted">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={t("products.imageAlt", {
                title: localizedProduct.title,
              })}
              fill
              sizes="(max-width: 639px) 100vw, 320px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-sm text-muted">
              {t("products.noImage")}
            </div>
          )}
        </div>

        <div className="p-4">
          <h2 className="line-clamp-2 h-12 text-base font-semibold leading-6 text-foreground">
            {localizedProduct.title}
          </h2>
          <p className="mt-1 truncate text-sm text-muted">
            {product.brand || t("comparison.emptyValue")}
          </p>

          <div className="mt-3">
            <div className="text-lg font-bold text-foreground">
              {formatPrice(finalPrice, product.currency)}
            </div>
            {product.oldPrice && (
              <div className="mt-1 text-sm text-muted line-through">
                {formatPrice(product.oldPrice, product.currency)}
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="flex gap-2 border-t border-border p-4">
        <AddToCartButton product={product} disabled={!isAvailable} />
        <Button
          type="button"
          variant="secondary"
          className="h-12 flex-1 px-3 text-sm"
          onClick={() => toggleProductInCompare(product)}
        >
          {t("comparison.remove")}
        </Button>
      </div>
    </article>
  );
};
