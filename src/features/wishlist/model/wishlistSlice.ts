import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { T_WishlistState } from "./types";



const initialState: T_WishlistState = {
  productIds: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.productIds.includes(productId)) {
        state.productIds = state.productIds.filter((id) => id !== productId);
      } else {
        state.productIds.push(productId);
      }
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;