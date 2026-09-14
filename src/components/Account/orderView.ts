import type {
  T_OrderDeliveryMethod,
  T_OrderPaymentMethod,
  T_OrderPaymentStatus,
  T_OrderStatus,
} from "@/entities/order";
import type { T_I18nContext, T_Locale } from "@/shared/i18n";

const localeCodes: Record<T_Locale, string> = {
  en: "en-US",
  uk: "uk-UA",
  ru: "ru-RU",
  de: "de-DE",
};

export const formatAccountPrice = (
  value: number,
  currency: string,
  locale: T_Locale,
) => new Intl.NumberFormat(localeCodes[locale], {
  style: "currency",
  currency,
}).format(value);

export const formatAccountDate = (value: string, locale: T_Locale) =>
  new Intl.DateTimeFormat(localeCodes[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const getOrderStatusLabel = (
  status: T_OrderStatus,
  t: T_I18nContext["t"],
) => t(`account.orders.status.${status}`);

export const getPaymentStatusLabel = (
  status: T_OrderPaymentStatus,
  t: T_I18nContext["t"],
) => t(`account.orders.paymentStatus.${status}`);

export const getPaymentMethodLabel = (
  method: T_OrderPaymentMethod,
  t: T_I18nContext["t"],
) => t(`account.orders.paymentMethod.${method}`);

export const getDeliveryMethodLabel = (
  method: T_OrderDeliveryMethod,
  t: T_I18nContext["t"],
) => t(`account.orders.deliveryMethod.${method}`);
