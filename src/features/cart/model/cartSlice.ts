import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { T_CartItem, T_CartState } from "./types";

const initialState: T_CartState = {
    products: [],
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addCartItem: (state, action: PayloadAction<T_CartItem & { allowBackorders?: boolean }>) => {
            const { allowBackorders = false, ...cartItem } = action.payload;
            const maxQuantity = allowBackorders ? Number.MAX_SAFE_INTEGER : cartItem.product.stockQuantity;
            const existingItem = state.products.find((item) => item.product.id === cartItem.product.id);
            if (existingItem) {
                existingItem.quantity = Math.min(
                    existingItem.quantity + cartItem.quantity,
                    maxQuantity,
                );

                return;
            }

            state.products.push({
                ...cartItem,
                quantity: Math.min(cartItem.quantity, maxQuantity),
            });
        },
        removeCartItem: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            state.products = state.products.filter((item) => item.product.id !== productId);
        },
        increaseCartItemQuantity: (state, action: PayloadAction<{ productId: string, allowBackorders?: boolean }>) => {
            const { productId, allowBackorders } = action.payload;

            const cartItem = state.products.find((item) => item.product.id === productId);
            if (!cartItem) return;
            cartItem.quantity = Math.min(
                cartItem.quantity + 1,
                allowBackorders ? Number.MAX_SAFE_INTEGER : cartItem.product.stockQuantity,
            );
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
        setCartItemQuantity: (state, action: PayloadAction<{ productId: string, quantity: number, allowBackorders?: boolean }>) => {
            const { productId, quantity, allowBackorders } = action.payload;
            const cartItem = state.products.find((item) => item.product.id === productId);
            if (!cartItem) return;

            if (quantity > 0) {
                cartItem.quantity = Math.min(quantity, allowBackorders ? Number.MAX_SAFE_INTEGER : cartItem.product.stockQuantity);
                return;
            }

            state.products = state.products.filter((item) => item.product.id !== productId);
        },
        removeAllCartItems: (state) => {
            state.products = [];
        },
        restoreCart: (state, action: PayloadAction<T_CartState>) => {
            state.products = action.payload.products;
        },
    }
})

export const { addCartItem, removeCartItem, increaseCartItemQuantity, decreaseCartItemQuantity, setCartItemQuantity, removeAllCartItems, restoreCart } = cartSlice.actions;
export default cartSlice.reducer;
