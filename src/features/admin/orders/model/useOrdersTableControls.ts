import { T_OrderSort, T_OrderStatus } from "@/entities/order"
import { useTableControls } from "@/hooks"

export const useOrdersTableControls = () => {
    return useTableControls<T_OrderStatus | "all", T_OrderSort>({
        initialStatus: "all",
        initialSort: "default",
        initialPageSize: 5
    })
}