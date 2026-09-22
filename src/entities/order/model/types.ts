import type { T_ProductCurrency } from "@/entities/product/model/types";

export type T_OrderStatus = "new" | "processing" | "completed" | "cancelled";

export const ORDER_DELIVERY_METHODS = ["courier", "pickup"] as const;
export type T_OrderDeliveryMethod = (typeof ORDER_DELIVERY_METHODS)[number];

export const ORDER_PAYMENT_METHODS = [
  "card_online",
  "paypal",
  "card_on_delivery",
  "cash_on_delivery",
] as const;
export type T_OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];
export type T_OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type T_OrderCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type T_OrderAddress = {
  country: string;
  city: string;
  postalCode: string;
  address: string;
};

export type T_OrderDelivery = {
  method: T_OrderDeliveryMethod;
  fee: number;
  address?: T_OrderAddress;
};

export type T_OrderPayment = {
  method: T_OrderPaymentMethod;
  status: T_OrderPaymentStatus;
};

export type T_OrderItem = {
  productId: string;
  variantId?: string;
  title: string;
  sku: string;
  thumbnail: string;
  quantity: number;
  baseUnitPrice: number;
  unitPrice: number;
  currency: T_ProductCurrency;
};

export type T_OrderTotals = {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

export type T_Order = {
  id: string | number;
  customerId?: string;
  price: number;
  status: T_OrderStatus;
  customer?: T_OrderCustomer;
  items?: T_OrderItem[];
  delivery?: T_OrderDelivery;
  payment?: T_OrderPayment;
  totals?: T_OrderTotals;
  currency?: T_ProductCurrency;
  comment?: string;
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type T_CreateOrderDto = Required<
  Pick<
    T_Order,
    | "price"
    | "customer"
    | "items"
    | "delivery"
    | "payment"
    | "totals"
    | "currency"
  >
> &
  Pick<T_Order, "comment" | "customerId">;

export type T_UpdateOrderDto = T_Order;
