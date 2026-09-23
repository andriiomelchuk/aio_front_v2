export type T_ContentPagesApiErrorCode =
  | "NOT_FOUND"
  | "DUPLICATE_SLUG"
  | "RESERVED_SLUG"
  | "INVALID_SLUG"
  | "INVALID_CONTENT"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export class ContentPagesApiError extends Error {
  constructor(
    public readonly code: T_ContentPagesApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ContentPagesApiError";
  }
}
