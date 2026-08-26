import { useTableControls } from "@/hooks/useTableControls";
import type { T_UserStatus } from "@/entities/user";
import type { T_UserSort } from "./userSort";

export const useUsersTableControls = () => {
  return useTableControls<T_UserStatus | "all", T_UserSort>({
    initialStatus: "all",
    initialSort: "default",
    initialPageSize: 5,
  });
};