export type T_MenusApiErrorCode =
  | "NOT_FOUND"
  | "DUPLICATE_KEY"
  | "INVALID_KEY"
  | "DUPLICATE_ASSIGNMENT"
  | "SIDEBAR_REGION_CONFLICT"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export class MenusApiError extends Error {
  constructor(public readonly code: T_MenusApiErrorCode, message: string) {
    super(message);
    this.name = "MenusApiError";
  }
}
