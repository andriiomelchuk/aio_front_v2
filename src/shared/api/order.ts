import type { T_UpdateOrderDto } from "@/features/admin/orders/model/types";


export const updateOrder = async (order: T_UpdateOrderDto) => {
  console.log("Update order request:", order);

  return order;
};
