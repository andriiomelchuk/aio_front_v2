// export type T_Order = {
//   id: string | number;
//   price: number;
//   status: "active" | "pending" | "completed" | "cancelled";
//   createdAt: string;
//   updatedAt: string;
//   contact: {
//     email: string;
//     phone: string;
//     deliveryAddress?: string;
//     name?: string;
//   };
//   products: {
//     id: number;
//     name: string;
//     quantity: number;
//     price: number;
//   }[];
// };


export type T_OrderStatus = "new" | "processing" | "completed" | "cancelled";

export type T_Order = {
  id: string | number;
  price: number;
  status: T_OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type T_OrderSort = "default" | "price-asc" | "price-desc" | "id-asc" | "id-desc";
