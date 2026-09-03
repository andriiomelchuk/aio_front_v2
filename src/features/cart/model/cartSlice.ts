import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { T_CartItem, T_CartState } from "./types";

const initialState: T_CartState = {
    products: [],
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addCartItem: (state, action: PayloadAction<T_CartItem>) => {
            const cartItem = action.payload;
            const existingItem = state.products.find((item) => item.product.id === cartItem.product.id);
            if (existingItem) {
                existingItem.quantity += cartItem.quantity;
                return;
            }

            state.products.push(cartItem);
        },
        removeCartItem: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            state.products = state.products.filter((item) => item.product.id !== productId);
        },
        increaseCartItemQuantity: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            state.products = state.products.map((item) => item.product.id === productId
                ? { ...item, quantity: item.quantity + 1 } : item)
        },
        decreaseCartItemQuantity: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            const cartItem = state.products.find((item) => item.product.id === productId);
            if (!cartItem) return;
            if (cartItem.quantity > 1) {
                cartItem.quantity--;
                return;
            }

            state.products = state.products.filter((item) => item.product.id !== productId)
        },
        setCartItemQuantity: (state, action: PayloadAction<{ productId: string, quantity: number }>) => {
            const { productId, quantity } = action.payload;
            const cartItem = state.products.find((item) => item.product.id === productId);
            if (!cartItem) return;

            if (quantity > 0) {
                cartItem.quantity = quantity;
            }
        },
        removeAllCartItems: (state) => {
            state.products = [];
        }
    }
})

export const { addCartItem, removeCartItem, increaseCartItemQuantity, decreaseCartItemQuantity, setCartItemQuantity, removeAllCartItems } = cartSlice.actions;
export default cartSlice.reducer;