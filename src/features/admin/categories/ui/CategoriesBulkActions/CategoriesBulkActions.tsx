import { AdminBulkActions } from "@/widgets/AdminWidgets";

import { useI18n } from "@/shared/i18n";
import { T_CategoriesBulkActionsProps } from "./types";

export const CategoriesBulkActions = ({
  selectedCount,
  selectedAction,
  onActionChange,
  onConfirm,
}: T_CategoriesBulkActionsProps) => {
  const { t } = useI18n();

  return (
    <AdminBulkActions
      selectedCount={selectedCount}
      selectedAction={selectedAction}
      onActionChange={onActionChange}
      onConfirm={onConfirm}
      actions={[
        { value: "active", label: t("admin.categories.bulk.activateSelected") },
        {
          value: "inactive",
          label: t("admin.categories.bulk.deactivateSelected"),
        },
        {
          value: "delete",
          label: t("admin.categories.bulk.deleteSelected"),
          variant: "danger",
        },
      ]}
    />
  );
};
