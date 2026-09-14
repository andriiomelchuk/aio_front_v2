import type { T_AuthSession } from "@/shared/api/auth";

export type T_AuthState = {
  session: T_AuthSession | null;
  isInitialized: boolean;
};
