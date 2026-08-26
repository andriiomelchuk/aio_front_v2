export type T_UsersBulkActionsProps = {
  selectedCount: number;
  selectedAction: string;
  onActionChange: (action: string) => void;
  onConfirm: () => void;
};