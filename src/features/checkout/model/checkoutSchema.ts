import { z } from "zod";
import {
  ORDER_DELIVERY_METHODS,
  ORDER_PAYMENT_METHODS,
} from "@/entities/order";
import type { T_I18nContext } from "@/shared/i18n";

export const createCheckoutSchema = (t: T_I18nContext["t"]) =>
  z
    .object({
      firstName: z.string().trim().min(1, t("checkout.validation.required")),
      lastName: z.string().trim().min(1, t("checkout.validation.required")),
      email: z
        .string()
        .trim()
        .min(1, t("checkout.validation.required"))
        .email(t("checkout.validation.invalidEmail")),
      phone: z
        .string()
        .trim()
        .min(1, t("checkout.validation.required"))
        .regex(/^[+\d][\d\s()-]{7,20}$/, t("checkout.validation.invalidPhone")),
      deliveryMethod: z.enum(ORDER_DELIVERY_METHODS),
      country: z.string().trim(),
      city: z.string().trim(),
      postalCode: z.string().trim(),
      address: z.string().trim(),
      paymentMethod: z.enum(ORDER_PAYMENT_METHODS),
      comment: z.string().trim().max(500, t("checkout.validation.commentTooLong")),
      acceptTerms: z.boolean().refine(Boolean, {
        message: t("checkout.validation.acceptTerms"),
      }),
    })
    .superRefine((values, context) => {
      if (values.deliveryMethod !== "courier") return;

      const requiredAddressFields = [
        ["country", values.country],
        ["city", values.city],
        ["postalCode", values.postalCode],
        ["address", values.address],
      ] as const;

      requiredAddressFields.forEach(([field, value]) => {
        if (!value) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: t("checkout.validation.required"),
          });
        }
      });
    });

export type T_CheckoutFormValues = z.infer<
  ReturnType<typeof createCheckoutSchema>
>;
