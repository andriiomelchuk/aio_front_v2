import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "@/features/wishlist/model/wishlistSlice";
import comparisonReducer from "@/features/comparison/model/comparisonSlice";
import cartReducer from "@/features/cart/model/cartSlice";

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    comparison: comparisonReducer,
    cart: cartReducer,
  },
});

export type T_RootState = ReturnType<typeof store.getState>;
export type T_AppDispatch = typeof store.dispatch;