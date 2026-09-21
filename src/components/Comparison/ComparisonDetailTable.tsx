import { useI18n } from "@/shared/i18n";
import { T_ComparisonTableProps } from "./types";
import { usePriceFormatter } from "@/shared/siteSettings";
import { useLocalizedProducts } from "@/features/catalog";

const stockLabelKeys = {
  in_stock: "products.stock.inStock",
  low_stock: "products.stock.lowStock",
  out_of_stock: "products.stock.outOfStock",
} as const;

export const ComparisonDetailTable = ({
  products,
  priceCalc,
}: T_ComparisonTableProps) => {
  const { t } = useI18n();
  const formatPrice = usePriceFormatter();
  const localizedProducts = useLocalizedProducts(products);

  const comparisonRows = [
    {
      label: t("comparison.table.brand"),
      getValue: (product: (typeof products)[number]) =>
        product.brand || t("comparison.emptyValue"),
    },
    {
      label: t("comparison.table.sku"),
      getValue: (product: (typeof products)[number]) => product.sku,
    },
    {
      label: t("comparison.table.category"),
      getValue: (product: (typeof products)[number]) => product.categoryId,
    },
    {
      label: t("comparison.table.stock"),
      getValue: (product: (typeof products)[number]) =>
        `${t(stockLabelKeys[product.stockStatus])}: ${product.stockQuantity}`,
    },
    {
      label: t("comparison.table.discount"),
      getValue: (product: (typeof products)[number]) =>
        product.discountPercentage
          ? `-${product.discountPercentage}%`
          : t("comparison.emptyValue"),
    },
    {
      label: t("comparison.table.weight"),
      getValue: (product: (typeof products)[number]) =>
        product.shipping?.weight
          ? `${product.shipping.weight} kg`
          : t("comparison.emptyValue"),
    },
    {
      label: t("comparison.table.dimensions"),
      getValue: (product: (typeof products)[number]) => {
        const { width, height, depth } = product.shipping ?? {};

        return width && height && depth
          ? `${width} x ${height} x ${depth}`
          : t("comparison.emptyValue");
      },
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left text-xs uppercase text-muted">
            <th className="w-44 px-4 py-3 font-semibold">
              {t("comparison.table.feature")}
            </th>
            {localizedProducts.map((product) => (
              <th key={product.id} className="min-w-48 px-4 py-3 font-semibold">
                {product.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-semibold text-muted">
              {t("comparison.table.price")}
            </td>
            {localizedProducts.map((product) => {
              const finalPrice = priceCalc(
                product.price,
                product.discountPercentage,
              );

              return (
                <td key={product.id} className="px-4 py-3">
                  <span className="font-bold text-foreground">
                    {formatPrice(finalPrice, product.currency)}
                  </span>
                </td>
              );
            })}
          </tr>

          {comparisonRows.map((row) => (
            <tr key={row.label} className="border-b border-border">
              <td className="px-4 py-3 font-semibold text-muted">
                {row.label}
              </td>
              {localizedProducts.map((product) => (
                <td key={product.id} className="px-4 py-3 text-foreground">
                  {row.getValue(product)}
                </td>
              ))}
            </tr>
          ))}

          <tr>
            <td className="px-4 py-3 font-semibold text-muted">
              {t("comparison.table.attributes")}
            </td>
            {localizedProducts.map((product) => (
              <td key={product.id} className="px-4 py-3">
                {product.attributes.length > 0 ? (
                  <div className="space-y-1">
                    {product.attributes.map((attribute) => (
                      <p key={`${attribute.name}-${attribute.value}`}>
                        <span className="text-muted">{attribute.name}:</span>{" "}
                        <span className="text-foreground">
                          {attribute.value}
                        </span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">
                    {t("comparison.emptyValue")}
                  </span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
