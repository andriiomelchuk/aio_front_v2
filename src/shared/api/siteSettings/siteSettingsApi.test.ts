import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSiteSettings } from "@/entities/siteSettings";
import { getSiteSettings, importSiteSettings, updateSiteSettings } from "./siteSettingsApi";
import type { SiteSettingsApiError } from "./types";

const createStorage = (initial: Record<string, string> = {}): Storage => {
  const values = new Map(Object.entries(initial));
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
};

const stubWindow = (storage: Storage) =>
  vi.stubGlobal("window", { localStorage: storage, dispatchEvent: vi.fn() });

const createInput = () => ({
  general: defaultSiteSettings.general,
  localization: defaultSiteSettings.localization,
  contact: defaultSiteSettings.contact,
  commerce: defaultSiteSettings.commerce,
  seo: defaultSiteSettings.seo,
  operations: defaultSiteSettings.operations,
});

afterEach(() => vi.unstubAllGlobals());

describe("site settings storage", () => {
  it("migrates legacy root fields and keeps a backup", async () => {
    const storage = createStorage({
      "aio-site-settings": JSON.stringify({ siteName: "Legacy AIO", maintenanceMode: true }),
    });
    stubWindow(storage);

    const settings = await getSiteSettings();

    expect(settings.general.siteName).toBe("Legacy AIO");
    expect(settings.operations.maintenanceMode).toBe(true);
    expect(settings.localization.defaultLocale).toBe("uk");
    expect(settings.localization.enabledLocales).toEqual(["uk", "en", "de", "ru"]);
    expect(storage.getItem("aio-site-settings-version")).toBe("3");
    expect(storage.getItem("aio-site-settings-migration-backup-v0")).not.toBeNull();
  });

  it("preserves malformed data and returns safe defaults", async () => {
    const storage = createStorage({ "aio-site-settings": "{broken" });
    stubWindow(storage);

    await expect(getSiteSettings()).resolves.toEqual(defaultSiteSettings);
    expect(storage.getItem("aio-site-settings")).toBe("{broken");
    expect(storage.getItem("aio-site-settings-migration-backup-v0")).toBe("{broken");
  });

  it("saves validated settings and emits a change event", async () => {
    const storage = createStorage();
    stubWindow(storage);
    const input = createInput();

    const saved = await updateSiteSettings({
      ...input,
      general: { ...input.general, siteName: "Configured AIO" },
    }, "AIO Developer");

    expect(saved.general.siteName).toBe("Configured AIO");
    expect(saved.updatedAt).toBeTruthy();
    expect(saved.updatedBy).toBe("AIO Developer");
    expect(saved.changeLog[0]).toMatchObject({ action: "update", updatedBy: "AIO Developer" });
    expect(window.dispatchEvent).toHaveBeenCalledOnce();
  });

  it("rejects invalid imports and invalid contact email", async () => {
    const storage = createStorage();
    stubWindow(storage);
    const input = createInput();

    await expect(importSiteSettings([])).rejects.toMatchObject<Partial<SiteSettingsApiError>>({ code: "INVALID_IMPORT" });
    await expect(importSiteSettings({ general: {} })).rejects.toMatchObject<Partial<SiteSettingsApiError>>({ code: "INVALID_IMPORT" });
    await expect(importSiteSettings({ ...input, unknown: true })).rejects.toMatchObject<Partial<SiteSettingsApiError>>({ code: "INVALID_IMPORT" });
    await expect(updateSiteSettings({ ...input, contact: { ...input.contact, email: "invalid" } }))
      .rejects.toMatchObject<Partial<SiteSettingsApiError>>({ code: "INVALID_SETTINGS" });
  });

  it.each([
    ["unknown nested field", (input: ReturnType<typeof createInput>) => ({
      ...input,
      general: { ...input.general, unexpected: true },
    })],
    ["invalid URL", (input: ReturnType<typeof createInput>) => ({
      ...input,
      contact: { ...input.contact, facebookUrl: "not-a-url" },
    })],
    ["fractional stock threshold", (input: ReturnType<typeof createInput>) => ({
      ...input,
      commerce: { ...input.commerce, lowStockThreshold: 1.5 },
    })],
    ["invalid order prefix", (input: ReturnType<typeof createInput>) => ({
      ...input,
      commerce: { ...input.commerce, orderPrefix: "AIO <script>" },
    })],
    ["malformed audit entry", (input: ReturnType<typeof createInput>) => ({
      ...input,
      changeLog: [{ id: "1", action: "unknown", createdAt: "yesterday", updatedBy: "Admin" }],
    })],
  ])("rejects an import with %s", async (_label, createInvalidImport) => {
    stubWindow(createStorage());

    await expect(importSiteSettings(createInvalidImport(createInput())))
      .rejects.toMatchObject<Partial<SiteSettingsApiError>>({ code: "INVALID_IMPORT" });
  });

  it("accepts a complete exported settings document", async () => {
    stubWindow(createStorage());
    const exportedSettings = {
      ...createInput(),
      updatedAt: "2026-09-17T07:00:00.000Z",
      updatedBy: "AIO Developer",
      changeLog: [{
        id: "change-1",
        action: "update" as const,
        createdAt: "2026-09-17T07:00:00.000Z",
        updatedBy: "AIO Developer",
      }],
    };

    await expect(importSiteSettings(exportedSettings, "Importer"))
      .resolves.toMatchObject({ updatedBy: "Importer" });
  });
});
