export type T_OrdersBulkActionsProps = {
  selectedCount: number;
  selectedAction: string;
  onActionChange: (action: string) => void;
  onConfirm: () => void;
};