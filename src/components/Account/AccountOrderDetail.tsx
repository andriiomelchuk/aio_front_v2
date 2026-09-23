"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { T_Order } from "@/entities/order";
import { useAuth } from "@/features/auth";
import { getOrderById } from "@/shared/api/orders";
import { useI18n } from "@/shared/i18n";
import { DataState } from "@/shared/ui";
import {
  formatAccountDate,
  formatAccountPrice,
  getDeliveryMethodLabel,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "./orderView";

export const AccountOrderDetail = ({ orderId }: { orderId: string }) => {
  const { t, locale } = useI18n();
  const { session, isInitialized } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<T_Order | null>(null);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isInitialized) return;
    if (!session) {
      router.replace(`/login?returnTo=${encodeURIComponent(`/account/orders/${orderId}`)}`);
      return;
    }

    getOrderById(orderId)
      .then((loadedOrder) => {
        if (loadedOrder.customerId !== session.customerId) throw new Error("Order unavailable");
        setOrder(loadedOrder);
      })
      .catch(() => setHasError(true));
  }, [isInitialized, orderId, reloadKey, router, session]);

  if (!isInitialized || (!order && !hasError)) return <DataState variant="loading" title={t("account.orders.loading")} className="mx-auto my-8 max-w-5xl" />;
  if (hasError) return <DataState variant="error" description={t("account.orders.loadError")} onAction={() => { setHasError(false); setOrder(null); setReloadKey((value) => value + 1); }} className="mx-auto my-8 max-w-5xl" />;
  if (!session || !order) return <DataState variant="empty" title={t("account.order.notFound")} className="mx-auto my-8 max-w-5xl" />;

  const currency = order.currency ?? "USD";
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link href="/account" className="text-sm font-medium text-muted hover:text-accent">{t("account.order.back")}</Link>
      <header className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div><p className="text-sm text-accent">{t("account.order.eyebrow")}</p><h1 className="mt-1 break-all text-2xl font-bold">#{order.id}</h1><p className="mt-2 text-sm text-muted">{formatAccountDate(order.createdAt, locale)}</p></div>
        <span className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent">{getOrderStatusLabel(order.status, t)}</span>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 className="text-lg font-semibold">{t("account.order.items")}</h2>
          <div className="mt-3 divide-y divide-border rounded-md border border-border">
            {(order.items ?? []).map((item) => (
              <article key={`${item.productId}-${item.sku}`} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
                <div className="relative aspect-square overflow-hidden rounded-md bg-surface-muted">{item.thumbnail ? <Image src={item.thumbnail} alt="" fill sizes="72px" className="object-contain" /> : null}</div>
                <div className="min-w-0"><h3 className="font-medium">{item.title}</h3><p className="mt-1 text-xs text-muted">{t("account.order.sku")}: {item.sku}</p><p className="text-xs text-muted">{t("account.order.quantity")}: {item.quantity}</p></div>
                <p className="col-start-2 font-semibold sm:col-start-auto">{formatAccountPrice(item.unitPrice * item.quantity, item.currency, locale)}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="border-b border-border pb-5"><h2 className="font-semibold">{t("account.order.summary")}</h2><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted">{t("cart.summary.subtotal")}</dt><dd>{formatAccountPrice(order.totals?.subtotal ?? order.price, currency, locale)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">{t("cart.summary.discount")}</dt><dd>-{formatAccountPrice(order.totals?.discount ?? 0, currency, locale)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">{t("cart.summary.shipping")}</dt><dd>{formatAccountPrice(order.totals?.delivery ?? 0, currency, locale)}</dd></div><div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold"><dt>{t("cart.summary.total")}</dt><dd>{formatAccountPrice(order.totals?.total ?? order.price, currency, locale)}</dd></div></dl></section>
          {order.delivery && <section className="border-b border-border pb-5"><h2 className="font-semibold">{t("account.order.delivery")}</h2><p className="mt-2 text-sm">{getDeliveryMethodLabel(order.delivery.method, t)}</p>{order.delivery.address && <address className="mt-2 not-italic text-sm text-muted">{order.delivery.address.address}<br />{order.delivery.address.postalCode} {order.delivery.address.city}<br />{order.delivery.address.country}</address>}</section>}
          {order.payment && <section><h2 className="font-semibold">{t("account.order.payment")}</h2><p className="mt-2 text-sm">{getPaymentMethodLabel(order.payment.method, t)}</p><p className="mt-1 text-sm text-muted">{getPaymentStatusLabel(order.payment.status, t)}</p></section>}
        </aside>
      </div>
    </section>
  );
};
