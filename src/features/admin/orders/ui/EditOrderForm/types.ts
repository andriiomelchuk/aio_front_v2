import type { T_Order, T_OrderStatus } from "@/entities/order";


export type T_EditOrderData = {
  orderId: string | number;
  price: number;
  status: T_OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type T_EditOrderFormProps = {
    order: T_Order;
    onCancel: () => void;
    onUpdate: (order: T_Order) => void;
};