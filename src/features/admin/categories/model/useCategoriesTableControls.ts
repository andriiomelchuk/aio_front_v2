import type { T_CategoriesStatus } from "@/entities/categories/model/types"
import type { T_CategoriesSort } from "./types"
import { useTableControls } from "@/hooks"

export const useCategoriesTableControls = () => {
    return useTableControls<T_CategoriesStatus | "all", T_CategoriesSort>({
        initialStatus: "all",
        initialSort: "default",
        initialPageSize: 5
    })
}
