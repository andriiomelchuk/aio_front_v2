import type { T_UpdateOrderDto } from "@/entities/order";

export const updateOrder = async (order: T_UpdateOrderDto) => {
  console.log("Update order request:", order);

  return order;
};
