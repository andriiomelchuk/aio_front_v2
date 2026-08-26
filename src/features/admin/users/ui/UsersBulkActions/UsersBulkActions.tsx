import { AdminBulkActions } from "@/widgets/AdminWidgets";
import type { T_UsersBulkActionsProps } from "./types";
import { useI18n } from "@/shared/i18n";

export const UsersBulkActions = ({
  selectedCount,
  selectedAction,
  onActionChange,
  onConfirm,
}: T_UsersBulkActionsProps) => {
  const { t } = useI18n();

  return (
    <AdminBulkActions
      selectedCount={selectedCount}
      selectedAction={selectedAction}
      onActionChange={onActionChange}
      onConfirm={onConfirm}
      actions={[
        { value: "block", label: t("admin.user.bulk.blockSelected") },
        { value: "active", label: t("admin.user.bulk.activateSelected") },
        {
          value: "delete",
          label: t("admin.user.bulk.deleteSelected"),
          variant: "danger",
        },
      ]}
    />
  );
};
