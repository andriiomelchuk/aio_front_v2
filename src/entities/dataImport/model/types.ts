export type T_ImportTarget = "products" | "categories" | "warehouse";
export type T_ImportFormat = "csv" | "xlsx" | "json";
export type T_ImportStrategy = "create" | "update" | "upsert";
export type T_ImportCell = string | number | boolean | null;
export type T_ImportRawRow = Record<string, T_ImportCell>;

export type T_ImportField = {
  key: string;
  label: string;
  required: boolean;
  aliases: string[];
};

export type T_ImportMapping = Record<string, string>;

export type T_ImportPreviewRow = {
  rowNumber: number;
  values: T_ImportRawRow;
  action: "create" | "update" | "skip";
  errors: string[];
};

export type T_ImportResult = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ rowNumber: number; message: string }>;
};

export type T_ImportHistoryItem = T_ImportResult & {
  id: string;
  target: T_ImportTarget;
  fileName: string;
  createdAt: string;
  createdBy: string;
};
