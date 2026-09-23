import {
  defaultSiteSettings,
  type T_SiteCurrency,
  type T_SiteLocale,
  type T_SiteSettings,
  type T_UpdateSiteSettingsDto,
} from "@/entities/siteSettings";
import { SiteSettingsApiError } from "./types";
import { siteSettingsImportSchema, siteSettingsInputSchema } from "./siteSettingsSchema";

const STORAGE_KEY = "aio-site-settings";
const VERSION_KEY = "aio-site-settings-version";
const BACKUP_KEY_PREFIX = "aio-site-settings-migration-backup-v";
const SCHEMA_VERSION = 3;
export const SITE_SETTINGS_CHANGE_EVENT = "aio-site-settings-change";
const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const locales: T_SiteLocale[] = ["uk", "en", "de", "ru"];
const currencies: T_SiteCurrency[] = ["UAH", "USD", "EUR", "GBP"];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const text = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;
const bool = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;
const number = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const auditEntries = (value: unknown): T_SiteSettings["changeLog"] =>
  Array.isArray(value)
    ? value.flatMap((entry) => {
        if (!isRecord(entry)) return [];
        if (
          typeof entry.id !== "string" ||
          !["update", "import", "reset"].includes(String(entry.action)) ||
          typeof entry.createdAt !== "string" ||
          typeof entry.updatedBy !== "string"
        ) return [];
        return [{
          id: entry.id,
          action: entry.action as T_SiteSettings["changeLog"][number]["action"],
          createdAt: entry.createdAt,
          updatedBy: entry.updatedBy,
        }];
      }).slice(0, 50)
    : [];

export const migrateSiteSettings = (value: unknown): T_SiteSettings => {
  const root = isRecord(value) ? value : {};
  const general = isRecord(root.general) ? root.general : {};
  const localization = isRecord(root.localization) ? root.localization : {};
  const contact = isRecord(root.contact) ? root.contact : {};
  const commerce = isRecord(root.commerce) ? root.commerce : {};
  const seo = isRecord(root.seo) ? root.seo : {};
  const operations = isRecord(root.operations) ? root.operations : {};
  const locale = locales.includes(localization.defaultLocale as T_SiteLocale)
    ? localization.defaultLocale as T_SiteLocale
    : defaultSiteSettings.localization.defaultLocale;
  const currency = currencies.includes(localization.currency as T_SiteCurrency)
    ? localization.currency as T_SiteCurrency
    : defaultSiteSettings.localization.currency;
  const storedEnabledLocales = Array.isArray(localization.enabledLocales)
    ? localization.enabledLocales
    : null;
  const enabledLocales = storedEnabledLocales
    ? locales.filter((item) => storedEnabledLocales.includes(item))
    : defaultSiteSettings.localization.enabledLocales;
  if (!enabledLocales.includes(locale)) enabledLocales.unshift(locale);

  return {
    general: {
      siteName: text(general.siteName ?? root.siteName, defaultSiteSettings.general.siteName),
      siteDescription: text(general.siteDescription, defaultSiteSettings.general.siteDescription),
      logoUrl: text(general.logoUrl, defaultSiteSettings.general.logoUrl),
    },
    localization: {
      defaultLocale: locale,
      enabledLocales,
      currency,
      timezone: text(localization.timezone, defaultSiteSettings.localization.timezone),
    },
    contact: {
      email: text(contact.email, ""),
      phone: text(contact.phone, ""),
      address: text(contact.address, ""),
      facebookUrl: text(contact.facebookUrl, ""),
      instagramUrl: text(contact.instagramUrl, ""),
    },
    commerce: {
      lowStockThreshold: Math.max(0, number(commerce.lowStockThreshold, defaultSiteSettings.commerce.lowStockThreshold)),
      showOutOfStockProducts: bool(commerce.showOutOfStockProducts, defaultSiteSettings.commerce.showOutOfStockProducts),
      allowBackorders: bool(commerce.allowBackorders, defaultSiteSettings.commerce.allowBackorders),
      orderPrefix: text(commerce.orderPrefix, defaultSiteSettings.commerce.orderPrefix),
    },
    seo: {
      defaultTitle: text(seo.defaultTitle, defaultSiteSettings.seo.defaultTitle),
      defaultDescription: text(seo.defaultDescription, defaultSiteSettings.seo.defaultDescription),
      keywords: text(seo.keywords, ""),
      socialImageUrl: text(seo.socialImageUrl, ""),
    },
    operations: {
      maintenanceMode: bool(operations.maintenanceMode ?? root.maintenanceMode, false),
      emailNotifications: bool(operations.emailNotifications, true),
    },
    updatedAt: text(root.updatedAt, ""),
    updatedBy: text(root.updatedBy, ""),
    changeLog: auditEntries(root.changeLog),
  };
};

const getStorage = () => typeof window === "undefined" ? undefined : window.localStorage;
const backup = (storage: Storage, raw: string) => {
  const version = storage.getItem(VERSION_KEY) ?? "0";
  const backupKey = `${BACKUP_KEY_PREFIX}${version}`;
  if (storage.getItem(backupKey) === null) {
    try { storage.setItem(backupKey, raw); } catch { /* Keep reads available. */ }
  }
};

export const readSiteSettings = (): T_SiteSettings => {
  const storage = getStorage();
  if (!storage) return defaultSiteSettings;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return defaultSiteSettings;

  try {
    const migrated = migrateSiteSettings(JSON.parse(raw) as unknown);
    const next = JSON.stringify(migrated);
    const version = Number(storage.getItem(VERSION_KEY) ?? 0);
    if (version <= SCHEMA_VERSION && next !== raw) {
      backup(storage, raw);
      storage.setItem(STORAGE_KEY, next);
    }
    if (version <= SCHEMA_VERSION) storage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    return migrated;
  } catch {
    backup(storage, raw);
    return defaultSiteSettings;
  }
};

const validate = (settings: T_UpdateSiteSettingsDto) => {
  const result = siteSettingsInputSchema.safeParse(settings);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new SiteSettingsApiError(
      "INVALID_SETTINGS",
      `${issue.path.join(".") || "settings"}: ${issue.message}`,
    );
  }
  return result.data;
};

const persist = (settings: T_SiteSettings) => {
  const storage = getStorage();
  if (!storage) throw new SiteSettingsApiError("STORAGE_UNAVAILABLE", "Site settings storage is unavailable");
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(settings));
    storage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    window.dispatchEvent(new Event(SITE_SETTINGS_CHANGE_EVENT));
  } catch {
    throw new SiteSettingsApiError("STORAGE_WRITE_FAILED", "Could not save site settings");
  }
};

export const getSiteSettings = async () => readSiteSettings();
const withAudit = (
  input: T_UpdateSiteSettingsDto,
  action: T_SiteSettings["changeLog"][number]["action"],
  updatedBy: string,
): T_SiteSettings => {
  const current = readSiteSettings();
  const createdAt = new Date().toISOString();
  const actor = updatedBy.trim() || "System";
  return {
    ...input,
    updatedAt: createdAt,
    updatedBy: actor,
    changeLog: [{ id: createId(), action, createdAt, updatedBy: actor }, ...current.changeLog].slice(0, 50),
  };
};

export const updateSiteSettings = async (input: T_UpdateSiteSettingsDto, updatedBy = "System") => {
  const settings = withAudit(validate(input), "update", updatedBy);
  persist(settings);
  return settings;
};
export const resetSiteSettings = async (updatedBy = "System") => {
  const settings = withAudit({
    general: defaultSiteSettings.general,
    localization: defaultSiteSettings.localization,
    contact: defaultSiteSettings.contact,
    commerce: defaultSiteSettings.commerce,
    seo: defaultSiteSettings.seo,
    operations: defaultSiteSettings.operations,
  }, "reset", updatedBy);
  persist(settings);
  return settings;
};
export const importSiteSettings = async (value: unknown, updatedBy = "System") => {
  const result = siteSettingsImportSchema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new SiteSettingsApiError(
      "INVALID_IMPORT",
      `${issue.path.join(".") || "settings"}: ${issue.message}`,
    );
  }
  const migrated = migrateSiteSettings(result.data);
  const input: T_UpdateSiteSettingsDto = {
    general: migrated.general,
    localization: migrated.localization,
    contact: migrated.contact,
    commerce: migrated.commerce,
    seo: migrated.seo,
    operations: migrated.operations,
  };
  validate(input);
  const settings = withAudit(input, "import", updatedBy);
  persist(settings);
  return settings;
};
export const getSiteSettingsStorageSnapshot = () =>
  getStorage()?.getItem(STORAGE_KEY) ?? "";
