import { T_User } from "@/entities/user";
import { statusBadgeVariant, statusLabel } from "./userStatusView";
import { AdminBadge } from "@/widgets/AdminWidgets";
import { Button } from "@/shared/ui";

export const mapUserRows = (users: T_User[]) => {
    const userRows = users.map((user) => ({
        ...user,
        status: (
          <AdminBadge variant={statusBadgeVariant[user.status]}>
            {statusLabel[user.status]}
          </AdminBadge>
        ),
        action: (
          <Button
            className="h-10"
            variant="ghost"
            onClick={() => console.log("Edit user", user.id)}
          >
            Edit
          </Button>
        ),
      }));

      return userRows
}