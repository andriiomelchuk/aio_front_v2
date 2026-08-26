import type { T_Order } from "@/entities/order";


export type T_OrdersModalsProps = {
  selectedOrder: T_Order | null;
  onCloseEditOrder: () => void;
  onUpdateOrder: (order: T_Order) => void;
  //TODO add when products are implemented. 
  //   onCloseAddOrder: () => void;
  //   isAddOrderOpen: boolean;
  //   onCreateOrder: (order: T_Order) => void;

};