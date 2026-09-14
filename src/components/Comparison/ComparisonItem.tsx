import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/features/cart";
import { useCompare } from "@/features/comparison/model/useCompare";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { T_ComparisonItemProps } from "./types";




export const ComparisonItem = ({product, priceCalc}: T_ComparisonItemProps) => {

  const { t } = useI18n();
  const { toggleProductInCompare } = useCompare();
  const mainImage =
    product.images.find((image) => image.isMain)?.url ?? product.thumbnail;
  const finalPrice = priceCalc(
    product.price,
    product.discountPercentage,
  );
  const isAvailable = product.stockStatus !== "out_of_stock";

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
                title: product.title,
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
            {product.title}
          </h2>
          <p className="mt-1 truncate text-sm text-muted">
            {product.brand || t("comparison.emptyValue")}
          </p>

          <div className="mt-3">
            <div className="text-lg font-bold text-foreground">
              {finalPrice.toFixed(2)} {product.currency}
            </div>
            {product.oldPrice && (
              <div className="mt-1 text-sm text-muted line-through">
                {product.oldPrice.toFixed(2)} {product.currency}
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
