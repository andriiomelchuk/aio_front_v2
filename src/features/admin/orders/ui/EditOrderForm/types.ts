import type { T_Order } from "@/entities/order";


export type T_EditOrderFormProps = {
    order: T_Order;
    onCancel: () => void;
    onUpdate?: (order: T_Order) => void;
};
