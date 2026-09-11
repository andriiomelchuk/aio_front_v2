import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "@/features/wishlist/model/wishlistSlice";
import comparisonReducer from "@/features/comparison/model/comparisonSlice";
import cartReducer from "@/features/cart/model/cartSlice";
import { cartMiddleware } from "@/features/cart/model/cartMiddleware";
import { comparisonMiddleware } from "@/features/comparison/model/comparisonMiddleware";
import { wishlistMiddleware } from "@/features/wishlist/model/wishlistMiddleware";

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    comparison: comparisonReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    cartMiddleware,
    comparisonMiddleware,
    wishlistMiddleware,
  ),

});

export type T_RootState = ReturnType<typeof store.getState>;
export type T_AppDispatch = typeof store.dispatch;
