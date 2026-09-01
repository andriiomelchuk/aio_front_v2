import { AdminBulkActions } from "@/widgets/AdminWidgets";
import type {
  T_ProductBulkAction,
  T_ProductsBulkActionsProps,
} from "./types";
import { useI18n } from "@/shared/i18n";

export const ProductsBulkActions = ({
  selectedCount,
  selectedAction,
  onActionChange,
  onConfirm,
}: T_ProductsBulkActionsProps) => {
  const { t } = useI18n();

  return (
    <AdminBulkActions
      selectedCount={selectedCount}
      selectedAction={selectedAction}
      onActionChange={(action) => onActionChange(action as T_ProductBulkAction)}
      onConfirm={onConfirm}
      actions={[
        { value: "draft", label: t("admin.products.bulk.moveToDraft") },
        { value: "active", label: t("admin.products.bulk.activateSelected") },
        {
          value: "archived",
          label: t("admin.products.bulk.archiveSelected"),
        },
        {
          value: "delete",
          label: t("admin.products.bulk.deleteSelected"),
          variant: "danger",
        },
      ]}
    />
  );
};
