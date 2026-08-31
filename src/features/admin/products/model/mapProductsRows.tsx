import type { T_Product } from "@/entities/product/model/types";
import type { T_I18nContext } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { AdminBadge } from "@/widgets/AdminWidgets";
import {
  getProductsStatusLabel,
  getProductsStockLabel,
  productsStatusBadgeVariant,
  productsStockBadgeVariant,
} from "./productsStatusView";
import Link from "next/link";

export const mapProductsRows = (
  products: T_Product[],
  t: T_I18nContext["t"],
  onEdit: (product: T_Product) => void,
) => {
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    sku: product.sku,
    category: product.categoryId,
    price: product.discountPercentage
      ? product.price - (product.price * product.discountPercentage) / 100
      : product.price,
    // price: `${product.price} ${product.currency}`,
    discount: product.discountPercentage
      ? `${product.discountPercentage}%`
      : "",
    old_price: product.discountPercentage ? product.price : "",
    stock: (
      <AdminBadge variant={productsStockBadgeVariant[product.stockStatus]}>
        {getProductsStockLabel(product.stockStatus, t)} ·{" "}
        {product.stockQuantity}
      </AdminBadge>
    ),
    status: (
      <AdminBadge variant={productsStatusBadgeVariant[product.status]}>
        {getProductsStatusLabel(product.status, t)}
      </AdminBadge>
    ),
    action: (
      <Link href={`/admin/products/${product.id}/edit`}>
        <Button
          className="h-10"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(product);
          }}
        >
          {t("admin.products.table.editButton")}
        </Button>
      </Link>
    ),
  }));
};
