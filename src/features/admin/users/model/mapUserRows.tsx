import type { T_User } from "@/entities/user";
import { statusBadgeVariant, statusLabel } from "./userStatusView";
import { AdminBadge } from "@/widgets/AdminWidgets";
import { Button } from "@/shared/ui";
import type { T_I18nContext } from "@/shared/i18n";


export const mapUserRows = (
  users: T_User[],
  t: T_I18nContext["t"],
  onEdit: (user: T_User) => void,
) => {
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    login: user.login,
    email: user.email,
    password: "*******",
    role: user.role,
    status: (
      <AdminBadge variant={statusBadgeVariant[user.status]}>
        {statusLabel[user.status]}
      </AdminBadge>
    ),
    action: (
      <Button
        className="h-10"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(user);
        }}
      >
        {t("admin.user.editButton")}
      </Button>
    ),
  }));
};
