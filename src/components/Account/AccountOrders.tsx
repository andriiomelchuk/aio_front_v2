"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import type { T_Order } from "@/entities/order";
import { useAuth } from "@/features/auth";
import { getOrders } from "@/shared/api/orders";
import { useI18n } from "@/shared/i18n";
import {
  formatAccountDate,
  formatAccountPrice,
  getOrderStatusLabel,
} from "./orderView";

export const AccountOrders = () => {
  const { t, locale } = useI18n();
  const { session } = useAuth();
  const [orders, setOrders] = useState<T_Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!session) return;

    getOrders({ customerId: session.customerId })
      .then(setOrders)
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [session]);

  if (isLoading) return <p className="text-sm text-muted">{t("account.orders.loading")}</p>;
  if (hasError) return <p role="alert" className="text-sm text-danger">{t("account.orders.loadError")}</p>;

  return (
    <section>
      <h2 className="text-xl font-semibold">{t("account.orders.title")}</h2>
      <p className="mt-1 text-sm text-muted">{t("account.orders.description")}</p>

      {!orders.length ? (
        <div className="mt-6 border-t border-border py-10 text-center">
          <PackageSearch aria-hidden="true" className="mx-auto h-9 w-9 text-muted" />
          <h3 className="mt-3 font-semibold">{t("account.orders.emptyTitle")}</h3>
          <p className="mt-1 text-sm text-muted">{t("account.orders.emptyDescription")}</p>
          <Link href="/products" className="mt-4 inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-semibold text-background hover:opacity-85">
            {t("account.orders.browseProducts")}
          </Link>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-md border border-border">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 border-b border-border bg-surface-muted px-4 py-3 text-xs font-semibold uppercase text-muted md:grid">
            <span>{t("account.orders.number")}</span><span>{t("account.orders.date")}</span><span>{t("account.orders.status")}</span><span>{t("account.orders.total")}</span><span className="sr-only">{t("account.orders.details")}</span>
          </div>
          {orders.map((order) => (
            <article key={order.id} className="grid gap-3 border-b border-border p-4 last:border-b-0 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4">
              <div><span className="text-xs text-muted md:hidden">{t("account.orders.number")}</span><p className="break-all font-semibold">#{order.id}</p></div>
              <div><span className="text-xs text-muted md:hidden">{t("account.orders.date")}</span><p className="text-sm">{formatAccountDate(order.createdAt, locale)}</p></div>
              <div><span className="text-xs text-muted md:hidden">{t("account.orders.status")}</span><p><span className="inline-flex rounded-full bg-accent-soft px-2 py-1 text-xs font-medium text-accent">{getOrderStatusLabel(order.status, t)}</span></p></div>
              <div><span className="text-xs text-muted md:hidden">{t("account.orders.total")}</span><p className="font-semibold">{formatAccountPrice(order.totals?.total ?? order.price, order.currency ?? "USD", locale)}</p></div>
              <Link href={`/account/orders/${encodeURIComponent(order.id)}`} className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium hover:bg-surface-muted">{t("account.orders.details")}</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
