import { useI18n } from "@/shared/i18n";
import { AdminBulkActions } from "@/widgets/AdminWidgets";
import type { T_OrdersBulkActionsProps } from "./types";

export const OrdersBulkActions = ({
  selectedCount,
  selectedAction,
  onActionChange,
  onConfirm,
}: T_OrdersBulkActionsProps) => {
  const { t } = useI18n();

  return (
    <AdminBulkActions
      selectedCount={selectedCount}
      selectedAction={selectedAction}
      onActionChange={onActionChange}
      onConfirm={onConfirm}
      actions={[
        {
          value: "processing",
          label: t("admin.orders.bulk.inProcessSelected"),
        },
        {
          value: "completed",
          label: t("admin.orders.bulk.completeSelected"),
        },
        {
          value: "cancelled",
          label: t("admin.orders.bulk.cancelSelected"),
          variant: "danger",
        },
      ]}
    />
  );
};

