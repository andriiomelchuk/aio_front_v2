import { calculateCartTotals } from "@/features/cart";
import { getCheckoutDeliveryFee } from "@/features/checkout";
import { useI18n } from "@/shared/i18n";
import { usePriceFormatter, useSiteSettings } from "@/shared/siteSettings";
import type { T_CheckoutSummaryProps } from "./types";

export const CheckoutSummary = ({
  items,
  deliveryMethod,
}: T_CheckoutSummaryProps) => {
  const { t } = useI18n();
  const settings = useSiteSettings();
  const formatPrice = usePriceFormatter();
  const { subtotal, discount, itemsTotal } = calculateCartTotals(items);
  const currency = items[0]?.product.currency ?? settings.localization.currency;
  const deliveryFee = getCheckoutDeliveryFee(deliveryMethod);
  const total = itemsTotal + deliveryFee;

  return (
    <aside className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-lg font-bold text-foreground">
        {t("checkout.summary.title")}
      </h2>

      <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-start justify-between gap-4 text-sm"
          >
            <div className="min-w-0">
              <p className="line-clamp-2 font-medium text-foreground">
                {item.product.title}
              </p>
              <p className="mt-1 text-xs text-muted">
                {t("checkout.summary.quantity", { count: item.quantity })}
              </p>
            </div>
            <span className="shrink-0 font-semibold text-foreground">
              {formatPrice(
                item.product.price *
                (1 - (item.product.discountPercentage ?? 0) / 100) *
                  item.quantity,
                item.product.currency,
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted">{t("cart.summary.subtotal")}</span>
          <span className="font-semibold text-foreground">
            {formatPrice(subtotal, currency)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted">{t("cart.summary.discount")}</span>
          <span className="font-semibold text-accent">
            -{formatPrice(discount, currency)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted">{t("cart.summary.shipping")}</span>
          <span className="font-semibold text-foreground">
            {deliveryFee > 0
              ? formatPrice(deliveryFee, currency)
              : t("checkout.summary.free")}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
        <span className="font-semibold text-foreground">
          {t("cart.summary.total")}
        </span>
        <span className="text-xl font-bold text-foreground">
          {formatPrice(total, currency)}
        </span>
      </div>
    </aside>
  );
};
