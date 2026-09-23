import {
  defaultDeveloperSettings,
  type T_DeveloperSettings,
  type T_UpdateDeveloperSettingsDto,
} from "@/entities/developerSettings";
import { adminModules, type T_AdminModule } from "@/shared/config/adminModules";
import { developerSettingsImportSchema, developerSettingsInputSchema } from "./developerSettingsSchema";
import { DeveloperSettingsApiError } from "./types";

const STORAGE_KEY = "aio-developer-settings";
const VERSION_KEY = "aio-developer-settings-version";
const BACKUP_KEY = "aio-developer-settings-migration-backup-v0";
const SCHEMA_VERSION = 1;
export const DEVELOPER_SETTINGS_CHANGE_EVENT = "aio-developer-settings-change";
const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const migrateDeveloperSettings = (value: unknown): T_DeveloperSettings => {
  const root = isRecord(value) ? value : {};
  const storedModules = isRecord(root.modules) ? root.modules : {};
  const diagnostics = isRecord(root.diagnostics) ? root.diagnostics : {};
  const modules = Object.keys(adminModules).reduce((result, module) => ({
    ...result,
    [module]: module === "developerSettings" || module === "dashboard"
      ? true
      : typeof storedModules[module] === "boolean"
        ? storedModules[module]
        : adminModules[module as T_AdminModule],
  }), {} as T_DeveloperSettings["modules"]);
  const changeLog = Array.isArray(root.changeLog)
    ? root.changeLog.filter(isRecord).flatMap((entry) => {
        if (
          typeof entry.id !== "string" ||
          !["update", "import", "reset"].includes(String(entry.action)) ||
          typeof entry.createdAt !== "string" ||
          typeof entry.updatedBy !== "string"
        ) return [];
        return [{
          id: entry.id,
          action: entry.action as T_DeveloperSettings["changeLog"][number]["action"],
          createdAt: entry.createdAt,
          updatedBy: entry.updatedBy,
        }];
      }).slice(0, 50)
    : [];

  return {
    modules,
    diagnostics: {
      enabled: typeof diagnostics.enabled === "boolean" ? diagnostics.enabled : false,
      showStorageUsage: typeof diagnostics.showStorageUsage === "boolean" ? diagnostics.showStorageUsage : true,
    },
    updatedAt: typeof root.updatedAt === "string" ? root.updatedAt : "",
    updatedBy: typeof root.updatedBy === "string" ? root.updatedBy : "",
    changeLog,
  };
};

const getStorage = () => typeof window === "undefined" ? undefined : window.localStorage;

export const getDeveloperSettingsStorageSnapshot = () =>
  getStorage()?.getItem(STORAGE_KEY) ?? "";

export const readDeveloperSettings = (): T_DeveloperSettings => {
  const storage = getStorage();
  if (!storage) return defaultDeveloperSettings;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return defaultDeveloperSettings;

  try {
    const settings = migrateDeveloperSettings(JSON.parse(raw) as unknown);
    const serialized = JSON.stringify(settings);
    if (serialized !== raw) {
      if (!storage.getItem(BACKUP_KEY)) storage.setItem(BACKUP_KEY, raw);
      storage.setItem(STORAGE_KEY, serialized);
    }
    storage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    return settings;
  } catch {
    if (!storage.getItem(BACKUP_KEY)) storage.setItem(BACKUP_KEY, raw);
    return defaultDeveloperSettings;
  }
};

const persist = (settings: T_DeveloperSettings) => {
  const storage = getStorage();
  if (!storage) throw new DeveloperSettingsApiError("STORAGE_UNAVAILABLE", "Developer settings storage is unavailable");
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(settings));
    storage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    window.dispatchEvent(new Event(DEVELOPER_SETTINGS_CHANGE_EVENT));
  } catch {
    throw new DeveloperSettingsApiError("STORAGE_WRITE_FAILED", "Could not save developer settings");
  }
};

const withAudit = (
  input: T_UpdateDeveloperSettingsDto,
  action: T_DeveloperSettings["changeLog"][number]["action"],
  updatedBy: string,
) => {
  const createdAt = new Date().toISOString();
  const actor = updatedBy.trim() || "Developer";
  return {
    ...input,
    updatedAt: createdAt,
    updatedBy: actor,
    changeLog: [{ id: createId(), action, createdAt, updatedBy: actor }, ...readDeveloperSettings().changeLog].slice(0, 50),
  } satisfies T_DeveloperSettings;
};

const validate = (input: T_UpdateDeveloperSettingsDto) => {
  const result = developerSettingsInputSchema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new DeveloperSettingsApiError("INVALID_SETTINGS", `${issue.path.join(".")}: ${issue.message}`);
  }
  return result.data;
};

export const updateDeveloperSettings = async (input: T_UpdateDeveloperSettingsDto, updatedBy = "Developer") => {
  const settings = withAudit(validate(input), "update", updatedBy);
  persist(settings);
  return settings;
};

export const resetDeveloperSettings = async (updatedBy = "Developer") => {
  const input = {
    modules: defaultDeveloperSettings.modules,
    diagnostics: defaultDeveloperSettings.diagnostics,
  };
  const settings = withAudit(input, "reset", updatedBy);
  persist(settings);
  return settings;
};

export const importDeveloperSettings = async (value: unknown, updatedBy = "Developer") => {
  const result = developerSettingsImportSchema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new DeveloperSettingsApiError("INVALID_IMPORT", `${issue.path.join(".")}: ${issue.message}`);
  }
  const input = { modules: result.data.modules, diagnostics: result.data.diagnostics };
  const settings = withAudit(input, "import", updatedBy);
  persist(settings);
  return settings;
};
