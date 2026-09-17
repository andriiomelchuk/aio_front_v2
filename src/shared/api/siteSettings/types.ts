export type T_SiteSettingsApiErrorCode =
  | "INVALID_SETTINGS"
  | "INVALID_IMPORT"
  | "UNSUPPORTED_IMPORT_VERSION"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export class SiteSettingsApiError extends Error {
  constructor(
    public readonly code: T_SiteSettingsApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SiteSettingsApiError";
  }
}
