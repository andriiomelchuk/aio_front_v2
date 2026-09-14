"use client";

import { useEffect } from "react";
import { useAuth } from "../../model/useAuth";

export const AuthInitializer = () => {
  const { restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return null;
};
