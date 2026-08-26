import { Button, Select } from "@/shared/ui";

import type { T_AdminBulkActionsProps } from "./types";
import { useI18n } from "@/shared/i18n";

export const AdminBulkActions = ({
  selectedCount,
  selectedAction,
  actions,
  onActionChange,
  onConfirm,
}: T_AdminBulkActionsProps) => {
  const { t } = useI18n();
  if (selectedCount === 0) {
    return null;
  }

  const selectedOption = actions.find(
    (action) => action.value === selectedAction,
  );
  const buttonVariant =
    selectedOption?.variant === "danger" ? "danger" : "default";

  return (
    <div className="mt-3 mb-3 flex flex-col gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-foreground">
        {t("admin.bulk.selected", { count: selectedCount })}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          name="bulkAction"
          value={selectedAction}
          onChange={(event) => onActionChange(event.target.value)}
          className="h-10 w-full sm:w-[180px]"
          options={[
            { value: "", label: t("admin.bulk.selectAction") },
            ...actions.map((action) => ({
              value: action.value,
              label: action.label,
            })),
          ]}
        />

        <Button
          type="button"
          variant={buttonVariant}
          className="h-10 w-full px-3 text-sm sm:w-auto"
          disabled={!selectedAction}
          onClick={onConfirm}
        >
          {t("admin.bulk.apply")}
        </Button>
      </div>
    </div>
  );
};
