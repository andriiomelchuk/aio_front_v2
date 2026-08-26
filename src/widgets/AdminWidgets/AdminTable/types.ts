export type T_AdminTableColumn<T> = {
  key: keyof T;
  label: string;
  align?: "left" | "center" | "right";
};

export type T_AdminTableProps<T> = {
  columns: readonly T_AdminTableColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T) => string | number;
  emptyText?: string;

  selectedRowKey?: string | number | null;
  onRowClick?: (row: T) => void;

  selectedRowKeys?: Array<string | number>;
  onSelectedRowKeysChange?: (keys: Array<string | number>) => void;
};
