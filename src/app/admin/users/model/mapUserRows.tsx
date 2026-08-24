import { T_User } from "@/entities/user";
import { statusBadgeVariant, statusLabel } from "./userStatusView";
import { AdminBadge } from "@/widgets/AdminWidgets";
import { Button } from "@/shared/ui";
import { T_I18nContext } from "@/shared/i18n";


export const mapUserRows = (
  users: T_User[],
  t: T_I18nContext["t"],
  onEdit: (user: T_User) => void,
) => {


  const userRows = users.map((user) => ({
    ...user,
    password: "*******",
    status: (
      <AdminBadge variant={statusBadgeVariant[user.status]}>
        {statusLabel[user.status]}
      </AdminBadge>
    ),
    action: (
      <Button
        className="h-10"
        variant="ghost"
        onClick={() => onEdit(user)}
      >
        {t("admin.user.editButton")}
      </Button>
    ),
  }));

  return userRows;
};
