import type { T_OrderDeliveryMethod } from "@/entities/order";

const COURIER_DELIVERY_FEE = 10;

export const getCheckoutDeliveryFee = (
  deliveryMethod: T_OrderDeliveryMethod,
) => (deliveryMethod === "courier" ? COURIER_DELIVERY_FEE : 0);
