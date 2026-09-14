import { useI18n } from "@/shared/i18n";
import { Input } from "@/shared/ui";
import { CheckoutSection } from "./CheckoutSection";
import type { T_CheckoutSectionProps } from "./types";

export const CheckoutContactSection = ({
  register,
  errors,
}: T_CheckoutSectionProps) => {
  const { t } = useI18n();

  return (
    <CheckoutSection
      title={t("checkout.contact.title")}
      description={t("checkout.contact.description")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          type="text"
          label={t("checkout.field.firstName")}
          placeholder={t("checkout.placeholder.firstName")}
          className="w-full"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          type="text"
          label={t("checkout.field.lastName")}
          placeholder={t("checkout.placeholder.lastName")}
          className="w-full"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
        <Input
          type="email"
          label={t("checkout.field.email")}
          placeholder={t("checkout.placeholder.email")}
          className="w-full"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          type="tel"
          label={t("checkout.field.phone")}
          placeholder={t("checkout.placeholder.phone")}
          className="w-full"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
    </CheckoutSection>
  );
};
