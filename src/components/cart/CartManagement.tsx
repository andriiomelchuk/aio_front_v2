"use client";

import { useI18n } from "@/shared/i18n";
import { useAppSelector } from "@/shared/store/hooks";
import { CartItem } from "./CartItem";

export const CartManagement = () => {
  const { t } = useI18n();
  const products = useAppSelector((state) => state.cart.products);

  const currency = products[0]?.product.currency ?? "USD";

  const subTotal = products.reduce((sum, item) => {
    const oldPrice = item.product.discountPercentage
      ? item.product.price
      : (item.product.oldPrice ?? item.product.price);

    return sum + oldPrice * item.quantity;
  }, 0);

  const total = products.reduce((sum, item) => {
    const productDiscount = item.product.discountPercentage ?? 0;
    const finalPrice = item.product.price * (1 - productDiscount / 100);

    return sum + finalPrice * item.quantity;
  }, 0);

  const discount = subTotal - total;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("cart.title")}
        </h1>
        <p className="text-sm text-muted">
          {t("cart.description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="hidden border-b border-border px-5 py-3 text-xs font-semibold uppercase text-muted md:grid md:grid-cols-[minmax(0,1fr)_120px_130px_120px_44px] md:gap-4">
            <span>{t("cart.table.product")}</span>
            <span className="text-right">{t("cart.table.basePrice")}</span>
            <span className="text-center">{t("cart.table.quantity")}</span>
            <span className="text-right">{t("cart.table.total")}</span>
            <span className="sr-only">{t("cart.table.remove")}</span>
          </div>

          <div className="divide-y divide-border">
            {products.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-border bg-surface p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-foreground">
            {t("cart.summary.title")}
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted">{t("cart.summary.subtotal")}</span>
              <span className="font-semibold text-foreground">
                {subTotal.toFixed(2)} {currency}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted">{t("cart.summary.discount")}</span>
              <span className="font-semibold text-accent">
                {discount.toFixed(2)} {currency}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted">{t("cart.summary.shipping")}</span>
              <span className="font-semibold text-foreground">
                {t("cart.summary.shippingCalculatedLater")}
              </span>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-semibold text-foreground">
                {t("cart.summary.total")}
              </span>
              <span className="text-xl font-bold text-foreground">
                {total.toFixed(2)} {currency}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 h-12 w-full rounded-md bg-accent px-5 font-semibold text-background transition hover:opacity-90"
          >
            {t("cart.checkout")}
          </button>

          <button
            type="button"
            className="mt-3 h-11 w-full rounded-md border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            {t("cart.continueShopping")}
          </button>
        </aside>
      </div>
    </main>
  );
};
