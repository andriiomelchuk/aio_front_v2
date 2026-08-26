export type T_AdminBulkActionOption = {
  value: string;
  label: string;
  variant?: "default" | "danger";
};

export type T_AdminBulkActionsProps = {
  selectedCount: number;
  selectedAction: string;
  actions: T_AdminBulkActionOption[];
  onActionChange: (action: string) => void;
  onConfirm: () => void;
};