import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { T_AuthSession } from "@/shared/api/auth";
import type { T_AuthState } from "./types";

const initialState: T_AuthState = {
  session: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSession: (state, action: PayloadAction<T_AuthSession>) => {
      state.session = action.payload;
      state.isInitialized = true;
    },
    clearAuthState: (state) => {
      state.session = null;
      state.isInitialized = true;
    },
    finishAuthInitialization: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { clearAuthState, finishAuthInitialization, setAuthSession } =
  authSlice.actions;
export default authSlice.reducer;
