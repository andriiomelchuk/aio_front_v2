export type T_AdminTableColumn<T> = {
  key: keyof T;
  label: string;
};

export type T_AdminTableProps<T> = {
  columns: readonly T_AdminTableColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T) => string | number;
  emptyText?: string;
};