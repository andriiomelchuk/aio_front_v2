import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { T_CartItem, T_CartState } from "./types";
import { getCartItemStockQuantity, isSameCartLine } from "./cartItem";

const initialState: T_CartState = {
    products: [],
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addCartItem: (state, action: PayloadAction<T_CartItem & { allowBackorders?: boolean }>) => {
            const { allowBackorders = false, ...cartItem } = action.payload;
            const maxQuantity = allowBackorders ? Number.MAX_SAFE_INTEGER : getCartItemStockQuantity(cartItem);
            const reference = { productId: cartItem.product.id, variantId: cartItem.variantId };
            const existingItem = state.products.find((item) => isSameCartLine(item, reference));
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
        removeCartItem: (state, action: PayloadAction<{ productId: string, variantId?: string }>) => {
            state.products = state.products.filter((item) => !isSameCartLine(item, action.payload));
        },
        increaseCartItemQuantity: (state, action: PayloadAction<{ productId: string, variantId?: string, allowBackorders?: boolean }>) => {
            const { allowBackorders, ...reference } = action.payload;

            const cartItem = state.products.find((item) => isSameCartLine(item, reference));
            if (!cartItem) return;
            cartItem.quantity = Math.min(
                cartItem.quantity + 1,
                allowBackorders ? Number.MAX_SAFE_INTEGER : getCartItemStockQuantity(cartItem),
            );
        },
        decreaseCartItemQuantity: (state, action: PayloadAction<{ productId: string, variantId?: string }>) => {
            const cartItem = state.products.find((item) => isSameCartLine(item, action.payload));
            if (!cartItem) return;
            if (cartItem.quantity > 1) {
                cartItem.quantity--;
                return;
            }

             state.products = state.products.filter((item) => !isSameCartLine(item, action.payload))
        },
        setCartItemQuantity: (state, action: PayloadAction<{ productId: string, variantId?: string, quantity: number, allowBackorders?: boolean }>) => {
            const { quantity, allowBackorders, ...reference } = action.payload;
            const cartItem = state.products.find((item) => isSameCartLine(item, reference));
            if (!cartItem) return;

            if (quantity > 0) {
                cartItem.quantity = Math.min(quantity, allowBackorders ? Number.MAX_SAFE_INTEGER : getCartItemStockQuantity(cartItem));
                return;
            }

            state.products = state.products.filter((item) => !isSameCartLine(item, reference));
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
