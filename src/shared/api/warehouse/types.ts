import { ApiError } from "@/shared/api/core";

export type T_WarehouseApiErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "INSUFFICIENT_STOCK"
  | "DUPLICATE_CODE"
  | "STORAGE_WRITE_FAILED";

export class WarehouseApiError extends ApiError<T_WarehouseApiErrorCode> {
  constructor(public readonly code: T_WarehouseApiErrorCode, message: string) {
    super(code, message);
    this.name = "WarehouseApiError";
  }
}
