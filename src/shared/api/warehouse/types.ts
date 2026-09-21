export type T_WarehouseApiErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "INSUFFICIENT_STOCK"
  | "DUPLICATE_CODE"
  | "STORAGE_WRITE_FAILED";

export class WarehouseApiError extends Error {
  constructor(public readonly code: T_WarehouseApiErrorCode, message: string) {
    super(message);
    this.name = "WarehouseApiError";
  }
}
