import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { T_ComparisonState } from "./types"
import type { T_Product } from "@/entities/product/model/types";


const initialState: T_ComparisonState = {
    products: [],
}

const comparisonSlice = createSlice({
    name: "comparison",
    initialState,
    reducers: {
        toggleProductInComparison: (state, action: PayloadAction<T_Product>) => {
            const product = action.payload;
            if (state.products.some((item) => item.id === product.id)) {
                state.products = state.products.filter((prod) => prod.id !== product.id)
            } else {
                state.products.push(product)
            }
        },
        restoreComparison: (state, action: PayloadAction<T_ComparisonState>) => {
            state.products = action.payload.products;
        },
    }
})

export const { toggleProductInComparison, restoreComparison } = comparisonSlice.actions
export default comparisonSlice.reducer