import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { T_CartItem } from "@/features/cart";
import type { T_CheckoutFormValues } from "@/features/checkout";

export type T_CheckoutSectionProps = {
  register: UseFormRegister<T_CheckoutFormValues>;
  errors: FieldErrors<T_CheckoutFormValues>;
};

export type T_CheckoutDeliverySectionProps = T_CheckoutSectionProps & {
  deliveryMethod: T_CheckoutFormValues["deliveryMethod"];
};

export type T_CheckoutSummaryProps = {
  items: T_CartItem[];
  deliveryMethod: T_CheckoutFormValues["deliveryMethod"];
};
