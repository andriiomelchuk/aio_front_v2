import {  T_CategoriesSort, T_CategoriesStatus } from "@/entities/categories/model/types"
import { useTableControls } from "@/hooks"

export const useCategoriesTableControls = () => {
    return useTableControls<T_CategoriesStatus | "all", T_CategoriesSort>({
        initialStatus: "all",
        initialSort: "default",
        initialPageSize: 5
    })
}