"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useI18n } from "@/shared/i18n";
import { useAuth } from "@/features/auth";

type T_CheckoutSuccessProps = {
  orderId: string;
};

export const CheckoutSuccess = ({ orderId }: T_CheckoutSuccessProps) => {
  const { t } = useI18n();
  const { session } = useAuth();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Check aria-hidden="true" className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase text-accent">
          {t("checkout.success.eyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {t("checkout.success.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
          {t("checkout.success.description")}
        </p>
        <p className="mt-4 text-sm text-muted">
          {t("checkout.success.orderNumber")}{" "}
          <span className="font-semibold text-foreground">#{orderId}</span>
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {session && (
            <Link
              href={`/account/orders/${encodeURIComponent(orderId)}`}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
            >
              {t("checkout.success.viewOrder")}
            </Link>
          )}
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {t("checkout.success.continueShopping")}
          </Link>
        </div>
      </section>
    </main>
  );
};
