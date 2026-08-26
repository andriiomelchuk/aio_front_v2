import type { useUsersTableControls } from "../../model/useUsersTableControls";

export type T_UsersToolbarProps = {
  tableControls: ReturnType<typeof useUsersTableControls>;
  onAddUserClick: () => void;
};