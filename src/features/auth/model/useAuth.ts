"use client";

import { useCallback } from "react";
import {
  clearAuthSession,
  loadAuthSession,
  loginCustomer,
  loginStaff,
  registerCustomer,
  saveAuthSession,
  updateAuthIdentity,
  type T_LoginCredentials,
  type T_RegisterCredentials,
} from "@/shared/api/auth";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import {
  clearAuthState,
  finishAuthInitialization,
  setAuthSession,
} from "./authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { session, isInitialized } = useAppSelector((state) => state.auth);

  const register = async (credentials: T_RegisterCredentials) => {
    const nextSession = await registerCustomer(credentials);
    saveAuthSession(nextSession);
    dispatch(setAuthSession(nextSession));
    return nextSession;
  };

  const login = async (credentials: T_LoginCredentials) => {
    const nextSession = await loginCustomer(credentials);
    saveAuthSession(nextSession);
    dispatch(setAuthSession(nextSession));
    return nextSession;
  };

  const staffLogin = async (credentials: T_LoginCredentials) => {
    const nextSession = await loginStaff(credentials);
    saveAuthSession(nextSession);
    dispatch(setAuthSession(nextSession));
    return nextSession;
  };

  const logout = () => {
    clearAuthSession();
    dispatch(clearAuthState());
  };

  const updateIdentity = async (identity: {
    email: string;
    displayName: string;
  }) => {
    if (!session) throw new Error("Authentication is required");

    const updatedSession = await updateAuthIdentity(session, identity);
    dispatch(setAuthSession(updatedSession));
    return updatedSession;
  };

  const restoreSession = useCallback(() => {
    const storedSession = loadAuthSession();
    dispatch(storedSession ? setAuthSession(storedSession) : finishAuthInitialization());
  }, [dispatch]);

  return {
    session,
    isAuthenticated: Boolean(session),
    isInitialized,
    register,
    login,
    staffLogin,
    logout,
    updateIdentity,
    restoreSession,
  };
};
