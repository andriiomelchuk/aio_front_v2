export type T_DeveloperSettingsApiErrorCode =
  | "INVALID_SETTINGS"
  | "INVALID_IMPORT"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export class DeveloperSettingsApiError extends Error {
  constructor(
    public readonly code: T_DeveloperSettingsApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DeveloperSettingsApiError";
  }
}
