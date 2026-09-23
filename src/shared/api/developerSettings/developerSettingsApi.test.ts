import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultDeveloperSettings } from "@/entities/developerSettings";
import { importDeveloperSettings, readDeveloperSettings, updateDeveloperSettings } from "./developerSettingsApi";
import type { DeveloperSettingsApiError } from "./types";

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

afterEach(() => vi.unstubAllGlobals());

describe("developer settings storage", () => {
  it("migrates partial settings and keeps developer access enabled", () => {
    const storage = createStorage({
      "aio-developer-settings": JSON.stringify({ modules: { dashboard: false, analytics: false } }),
    });
    stubWindow(storage);

    const settings = readDeveloperSettings();

    expect(settings.modules.analytics).toBe(false);
    expect(settings.modules.dashboard).toBe(true);
    expect(settings.modules.products).toBe(true);
    expect(settings.modules.developerSettings).toBe(true);
    expect(storage.getItem("aio-developer-settings-migration-backup-v0")).not.toBeNull();
  });

  it("saves module flags with an audit entry", async () => {
    stubWindow(createStorage());

    const settings = await updateDeveloperSettings({
      modules: { ...defaultDeveloperSettings.modules, analytics: false },
      diagnostics: { enabled: true, showStorageUsage: true },
    }, "AIO Developer");

    expect(settings.modules.analytics).toBe(false);
    expect(settings.updatedBy).toBe("AIO Developer");
    expect(settings.changeLog[0]).toMatchObject({ action: "update", updatedBy: "AIO Developer" });
  });

  it("rejects unknown fields and disabling protected modules", async () => {
    stubWindow(createStorage());

    await expect(importDeveloperSettings({
      modules: { ...defaultDeveloperSettings.modules, developerSettings: false },
      diagnostics: defaultDeveloperSettings.diagnostics,
    })).rejects.toMatchObject<Partial<DeveloperSettingsApiError>>({ code: "INVALID_IMPORT" });

    await expect(importDeveloperSettings({
      modules: { ...defaultDeveloperSettings.modules, dashboard: false },
      diagnostics: defaultDeveloperSettings.diagnostics,
    })).rejects.toMatchObject<Partial<DeveloperSettingsApiError>>({ code: "INVALID_IMPORT" });

    await expect(importDeveloperSettings({
      modules: defaultDeveloperSettings.modules,
      diagnostics: defaultDeveloperSettings.diagnostics,
      unknown: true,
    })).rejects.toMatchObject<Partial<DeveloperSettingsApiError>>({ code: "INVALID_IMPORT" });
  });
});
