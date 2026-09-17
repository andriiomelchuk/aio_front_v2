"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  createCheckoutSchema,
  createOrderDto,
  type T_CheckoutFormValues,
} from "@/features/checkout";
import { useCart } from "@/features/cart/model/useCart";
import { createOrder } from "@/shared/api/orders";
import { useI18n } from "@/shared/i18n";
import { useAppSelector } from "@/shared/store/hooks";
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useSiteSettings } from "@/shared/siteSettings";
import { CheckoutContactSection } from "./CheckoutContactSection";
import { CheckoutDeliverySection } from "./CheckoutDeliverySection";
import { CheckoutPaymentSection } from "./CheckoutPaymentSection";
import { CheckoutSummary } from "./CheckoutSummary";

export const CheckoutManagement = () => {
  const { t } = useI18n();
  const router = useRouter();
  const items = useAppSelector((state) => state.cart.products);
  const { clearCart } = useCart();
  const { session } = useAuth();
  const settings = useSiteSettings();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const checkoutSchema = useMemo(() => createCheckoutSchema(t), [t]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<T_CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      deliveryMethod: "courier",
      country: "",
      city: "",
      postalCode: "",
      address: "",
      paymentMethod: "card_online",
      comment: "",
      acceptTerms: false,
    },
  });
  const deliveryMethod = useWatch({
    control,
    name: "deliveryMethod",
  });

  const handleCheckoutSubmit = async (values: T_CheckoutFormValues) => {
    setSubmitError(null);

    try {
      if (!settings.commerce.allowBackorders && items.some((item) => item.quantity > item.product.stockQuantity)) {
        throw new Error("Cart quantity exceeds available stock");
      }
      const order = await createOrder(
        createOrderDto(values, items, session?.customerId),
      );

      clearCart();
      router.push(`/checkout/success?orderId=${encodeURIComponent(order.id)}`);
    } catch {
      setSubmitError(t("checkout.error.createOrder"));
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
          <h1 className="text-2xl font-bold text-foreground">
            {t("checkout.emptyTitle")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            {t("checkout.emptyDescription")}
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {t("checkout.browseProducts")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/cart"
        className="text-sm font-medium text-muted transition hover:text-accent"
      >
        {t("checkout.backToCart")}
      </Link>

      <div className="mb-6 mt-5 sm:mb-8">
        <p className="text-sm font-semibold uppercase text-accent">
          {t("checkout.eyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {t("checkout.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          {t("checkout.description")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleCheckoutSubmit)}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"
        noValidate
      >
        <div className="space-y-5">
          <CheckoutContactSection register={register} errors={errors} />
          <CheckoutDeliverySection
            register={register}
            errors={errors}
            deliveryMethod={deliveryMethod}
          />
          <CheckoutPaymentSection register={register} errors={errors} />
        </div>

        <div className="h-fit space-y-4 lg:sticky lg:top-24">
          <CheckoutSummary items={items} deliveryMethod={deliveryMethod} />
          {submitError && (
            <p
              role="alert"
              className="rounded-md border border-danger bg-surface p-3 text-sm text-danger"
            >
              {submitError}
            </p>
          )}
          <Button
            type="submit"
            className="h-12 w-full px-5 font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("checkout.submitting")
              : t("checkout.confirmDetails")}
          </Button>
        </div>
      </form>
    </main>
  );
};
