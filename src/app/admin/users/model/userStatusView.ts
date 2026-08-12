import { T_UserStatus } from "@/entities/user";

export const statusBadgeVariant: Record<
  T_UserStatus,
  "success" | "neutral" | "danger"
> = {
  active: "success",
  invited: "neutral",
  blocked: "danger",
};

export const statusLabel: Record<T_UserStatus, string> = {
  active: "Active",
  invited: "Invited",
  blocked: "Blocked",
};
