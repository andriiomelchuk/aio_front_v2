import { ApiError } from "@/shared/api/core";

export type T_DeveloperSettingsApiErrorCode =
  | "INVALID_SETTINGS"
  | "INVALID_IMPORT"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export class DeveloperSettingsApiError extends ApiError<T_DeveloperSettingsApiErrorCode> {
  constructor(
    public readonly code: T_DeveloperSettingsApiErrorCode,
    message: string,
  ) {
    super(code, message);
    this.name = "DeveloperSettingsApiError";
  }
}
