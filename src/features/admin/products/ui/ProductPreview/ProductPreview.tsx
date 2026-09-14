import Image from "next/image";
import { useI18n } from "@/shared/i18n";
import { AdminBadge } from "@/widgets/AdminWidgets";
import {
  getProductsStockLabel,
  productsStockBadgeVariant,
} from "../../model";
import type { T_ProductPreviewProps } from "./types";

const formatPrice = (
  price: number | undefined,
  currency: string | undefined,
) => {
  if (typeof price !== "number") {
    return "";
  }

  return `${price.toFixed(2)} ${currency ?? ""}`.trim();
};

export const ProductPreview = ({ product }: T_ProductPreviewProps) => {
  const { t } = useI18n();
  const title = product?.title || t("admin.product.preview.emptyTitle");
  const image = product?.thumbnail || product?.images?.[0]?.url;
  const currentPrice = formatPrice(product?.price, product?.currency);
  const oldPrice = formatPrice(product?.oldPrice, product?.currency);

  return (
    <aside className="lg:sticky lg:top-6">
      <div className="rounded-md border border-border bg-surface shadow-sm shadow-shadow-color">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            {t("admin.product.preview.title")}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t("admin.product.preview.description")}
          </p>
        </div>

        <div className="p-4">
          <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-background">
            {image ? (
              <Image
                src={image}
                alt={product?.title ?? t("admin.product.preview.emptyTitle")}
                fill
                unoptimized
                sizes="(max-width: 1023px) 100vw, 320px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-muted px-4 text-center text-sm text-muted">
                {t("admin.product.preview.noImage")}
              </div>
            )}
          </div>

          <div className="mt-4">
            <h2 className="line-clamp-2 text-lg font-semibold text-foreground">
              {title}
            </h2>

            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              {currentPrice ? (
                <span className="text-xl font-semibold text-foreground">
                  {currentPrice}
                </span>
              ) : (
                <span className="text-sm text-muted">
                  {t("admin.product.preview.noPrice")}
                </span>
              )}

              {oldPrice && (
                <span className="text-sm text-muted line-through">
                  {oldPrice}
                </span>
              )}

              {product?.discountPercentage ? (
                <span className="rounded-md bg-danger/10 px-2 py-1 text-xs font-semibold text-danger">
                  -{product.discountPercentage}%
                </span>
              ) : null}
            </div>

            <div className="mt-4">
              {product ? (
                <AdminBadge
                  variant={productsStockBadgeVariant[product.stockStatus]}
                >
                  {getProductsStockLabel(product.stockStatus, t)} -{" "}
                  {product.stockQuantity}
                </AdminBadge>
              ) : (
                <AdminBadge variant="neutral">
                  {t("admin.product.preview.noStock")}
                </AdminBadge>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
