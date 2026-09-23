import { ApiError } from "@/shared/api/core";

export type T_TranslationsApiErrorCode =
  | "INVALID_IMPORT"
  | "UNKNOWN_KEY"
  | "VALIDATION_FAILED"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export class TranslationsApiError extends ApiError<T_TranslationsApiErrorCode> {
  constructor(
    public readonly code: T_TranslationsApiErrorCode,
    message: string,
  ) {
    super(code, message);
    this.name = "TranslationsApiError";
  }
}
