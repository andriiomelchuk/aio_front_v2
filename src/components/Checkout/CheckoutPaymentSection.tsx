import { useI18n } from "@/shared/i18n";
import { Checkbox, Textarea } from "@/shared/ui";
import { CheckoutSection } from "./CheckoutSection";
import type { T_CheckoutSectionProps } from "./types";

const paymentMethods = [
  {
    value: "card_online",
    labelKey: "checkout.payment.cardOnline",
    descriptionKey: "checkout.payment.cardOnlineDescription",
    badge: "Visa / Mastercard",
  },
  {
    value: "paypal",
    labelKey: "checkout.payment.paypal",
    descriptionKey: "checkout.payment.paypalDescription",
    badge: "PayPal",
  },
  {
    value: "card_on_delivery",
    labelKey: "checkout.payment.card",
    descriptionKey: "checkout.payment.cardDescription",
  },
  {
    value: "cash_on_delivery",
    labelKey: "checkout.payment.cash",
    descriptionKey: "checkout.payment.cashDescription",
  },
] as const;

export const CheckoutPaymentSection = ({
  register,
  errors,
}: T_CheckoutSectionProps) => {
  const { t } = useI18n();

  return (
    <CheckoutSection
      title={t("checkout.payment.title")}
      description={t("checkout.payment.description")}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {paymentMethods.map((method) => (
          <label
            key={method.value}
            className="flex min-h-28 cursor-pointer gap-3 rounded-md border border-border bg-background p-4 transition hover:bg-surface-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
          >
            <input
              type="radio"
              value={method.value}
              className="mt-1 h-4 w-4 shrink-0 accent-accent"
              {...register("paymentMethod")}
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-foreground">
                  {t(method.labelKey)}
                </span>
                {"badge" in method && (
                  <span className="rounded border border-border px-2 py-0.5 text-xs font-semibold text-muted">
                    {method.badge}
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm leading-5 text-muted">
                {t(method.descriptionKey)}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5">
        <Textarea
          label={t("checkout.field.comment")}
          placeholder={t("checkout.placeholder.comment")}
          error={errors.comment?.message}
          {...register("comment")}
        />
      </div>

      <div className="mt-5">
        <Checkbox
          label={t("checkout.terms.label")}
          description={t("checkout.terms.description")}
          error={errors.acceptTerms?.message}
          {...register("acceptTerms")}
        />
      </div>
    </CheckoutSection>
  );
};
