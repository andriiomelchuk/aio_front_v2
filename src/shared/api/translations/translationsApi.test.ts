import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPlaceholders,
  getPublishedTranslationOverrides,
  getTranslationWorkspace,
  importTranslationDraft,
  publishTranslations,
  saveTranslationDraft,
  TRANSLATIONS_STORAGE_KEY,
  TranslationsApiError,
  validateTranslationValues,
} from ".";

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };
};

const actor = { id: "staff-developer", name: "AIO Developer" };

describe("translationsApi", () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    vi.stubGlobal("window", { localStorage: storage, dispatchEvent: vi.fn() });
  });

  it("extracts unique sorted placeholders", () => {
    expect(getPlaceholders("Page {page} of {totalPages}; again {page}"))
      .toEqual(["page", "totalPages"]);
  });

  it("detects missing translations and incompatible placeholders", () => {
    const issues = validateTranslationValues("common", {
      "pagination.pageOf": "Page {page}",
    });
    expect(issues.some((issue) => issue.key === "pagination.pageOf" && issue.type === "placeholder")).toBe(true);
    expect(issues.some((issue) => issue.type === "missing")).toBe(true);
  });

  it("keeps saved drafts away from published runtime overrides", async () => {
    const workspace = await getTranslationWorkspace("de", "common");
    await saveTranslationDraft("de", "common", {
      ...workspace.draft,
      "nav.home": "Startseite Test",
    }, actor);

    expect(getPublishedTranslationOverrides("de")["nav.home"]).toBeUndefined();

    await publishTranslations("de", "common", actor);
    expect(getPublishedTranslationOverrides("de")["nav.home"]).toBe("Startseite Test");
  });

  it("blocks publishing when placeholders do not match English", async () => {
    const workspace = await getTranslationWorkspace("uk", "common");
    await saveTranslationDraft("uk", "common", {
      ...workspace.draft,
      "pagination.pageOf": "Сторінка {page}",
    }, actor);

    await expect(publishTranslations("uk", "common", actor)).rejects.toMatchObject({
      code: "VALIDATION_FAILED",
    });
  });

  it("rejects unknown imported system keys", async () => {
    await expect(importTranslationDraft(
      "en",
      "common",
      JSON.stringify({ "unknown.key": "Value" }),
      actor,
    )).rejects.toBeInstanceOf(TranslationsApiError);
  });

  it("records the author and action history", async () => {
    const workspace = await getTranslationWorkspace("en", "common");
    const saved = await saveTranslationDraft("en", "common", workspace.draft, actor);
    expect(saved.history[0]).toMatchObject({ action: "saved", author: actor });
  });

  it("falls back safely when stored data is corrupted", () => {
    storage.setItem(TRANSLATIONS_STORAGE_KEY, "not-json");
    expect(getPublishedTranslationOverrides("ru")).toEqual({});
  });
});
