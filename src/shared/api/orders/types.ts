import type {
  T_CreateOrderDto,
  T_Order,
  T_OrderStatus,
  T_UpdateOrderDto,
  T_UpdateOrderOptions,
} from "@/entities/order";
import { ApiError } from "@/shared/api/core";

export type T_GetOrdersParams = {
  customerId?: string;
  customerEmail?: string;
  status?: T_OrderStatus;
};

export type T_OrdersApiErrorCode =
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "INVALID_STATE"
  | "STORAGE_WRITE_FAILED";

export class OrdersApiError extends ApiError<T_OrdersApiErrorCode> {
  constructor(code: T_OrdersApiErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
    this.name = "OrdersApiError";
  }
}

export type T_OrdersApiContract = {
  getOrders: (params?: T_GetOrdersParams) => Promise<T_Order[]>;
  getOrderById: (id: string | number) => Promise<T_Order>;
  createOrder: (input: T_CreateOrderDto) => Promise<T_Order>;
  updateOrder: (input: T_UpdateOrderDto, options?: T_UpdateOrderOptions) => Promise<T_Order>;
};
