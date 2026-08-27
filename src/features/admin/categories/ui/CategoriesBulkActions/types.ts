export type T_CategoriesBulkActionsProps = {
  selectedCount: number;
  selectedAction: string;
  onActionChange: (action: string) => void;
  onConfirm: () => void;
};