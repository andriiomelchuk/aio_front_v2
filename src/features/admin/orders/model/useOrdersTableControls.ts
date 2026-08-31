import type { T_OrderStatus } from "@/entities/order"
import type { T_OrderSort } from "./types"
import { useTableControls } from "@/hooks"

export const useOrdersTableControls = () => {
    return useTableControls<T_OrderStatus | "all", T_OrderSort>({
        initialStatus: "all",
        initialSort: "default",
        initialPageSize: 5
    })
}
