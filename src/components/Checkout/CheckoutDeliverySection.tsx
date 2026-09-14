import { useI18n } from "@/shared/i18n";
import { Input } from "@/shared/ui";
import { CheckoutSection } from "./CheckoutSection";
import type { T_CheckoutDeliverySectionProps } from "./types";

export const CheckoutDeliverySection = ({
  register,
  errors,
  deliveryMethod,
}: T_CheckoutDeliverySectionProps) => {
  const { t } = useI18n();

  return (
    <CheckoutSection
      title={t("checkout.delivery.title")}
      description={t("checkout.delivery.description")}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer gap-3 rounded-md border border-border bg-background p-4 transition hover:bg-surface-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
          <input
            type="radio"
            value="courier"
            className="mt-1 h-4 w-4 accent-accent"
            {...register("deliveryMethod")}
          />
          <span>
            <span className="block font-semibold text-foreground">
              {t("checkout.delivery.courier")}
            </span>
            <span className="mt-1 block text-sm text-muted">
              {t("checkout.delivery.courierDescription")}
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer gap-3 rounded-md border border-border bg-background p-4 transition hover:bg-surface-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
          <input
            type="radio"
            value="pickup"
            className="mt-1 h-4 w-4 accent-accent"
            {...register("deliveryMethod")}
          />
          <span>
            <span className="block font-semibold text-foreground">
              {t("checkout.delivery.pickup")}
            </span>
            <span className="mt-1 block text-sm text-muted">
              {t("checkout.delivery.pickupDescription")}
            </span>
          </span>
        </label>
      </div>

      {deliveryMethod === "courier" && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            type="text"
            label={t("checkout.field.country")}
            className="w-full"
            autoComplete="country-name"
            error={errors.country?.message}
            {...register("country")}
          />
          <Input
            type="text"
            label={t("checkout.field.city")}
            className="w-full"
            autoComplete="address-level2"
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            type="text"
            label={t("checkout.field.postalCode")}
            className="w-full"
            autoComplete="postal-code"
            error={errors.postalCode?.message}
            {...register("postalCode")}
          />
          <Input
            type="text"
            label={t("checkout.field.address")}
            className="w-full"
            autoComplete="street-address"
            error={errors.address?.message}
            {...register("address")}
          />
        </div>
      )}
    </CheckoutSection>
  );
};
