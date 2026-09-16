export type T_TranslationsApiErrorCode =
  | "INVALID_IMPORT"
  | "UNKNOWN_KEY"
  | "VALIDATION_FAILED"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export class TranslationsApiError extends Error {
  constructor(
    public readonly code: T_TranslationsApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "TranslationsApiError";
  }
}
