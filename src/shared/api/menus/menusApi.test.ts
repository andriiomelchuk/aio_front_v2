import { afterEach, describe, expect, it, vi } from "vitest";
import { createMenuLocalizedText } from "@/entities/menu";
import { createMenu, deleteMenu, duplicateMenu, getMenuAssignments, getMenuById, getMenus, saveMenuAssignment, updateMenu } from "./menusApi";
import type { MenusApiError } from "./types";

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

const validMenu = {
  id: "menu-1",
  name: "Main",
  key: "main",
  status: "published",
  defaultLocale: "en",
  items: [],
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

const stubWindow = (storage: Storage) =>
  vi.stubGlobal("window", { localStorage: storage, dispatchEvent: vi.fn() });

afterEach(() => vi.unstubAllGlobals());

describe("menus storage normalization", () => {
  it("backs up invalid records before keeping recoverable menus", async () => {
    const menu = { ...validMenu, items: [
      { id: "valid", label: createMenuLocalizedText("en", "Valid"), href: "/", openInNewTab: false, isVisible: true, children: [] },
      { id: "invalid", href: "/broken" },
    ] };
    const storage = createStorage({ "aio-menus": JSON.stringify([menu, { id: "broken" }]) });
    const originalValue = storage.getItem("aio-menus");
    stubWindow(storage);

    const menus = await getMenus();

    expect(menus).toHaveLength(1);
    expect(menus[0].items).toHaveLength(1);
    expect(storage.getItem("aio-menus-migration-backup-v0")).toBe(originalValue);
    expect(storage.getItem("aio-menu-storage-version")).toBe("1");
  });

  it("migrates legacy menu fields without losing the menu", async () => {
    const storage = createStorage({
      "aio-menus": JSON.stringify([{
        id: "legacy-menu",
        name: "Legacy main",
        key: "Legacy Main",
        status: "published",
        items: [{
          id: "legacy-item",
          label: "Home",
          href: "/",
        }],
      }]),
    });
    stubWindow(storage);

    const [menu] = await getMenus();

    expect(menu).toMatchObject({
      id: "legacy-menu",
      name: "Legacy main",
      key: "legacy-main",
      status: "published",
      defaultLocale: "uk",
    });
    expect(menu.createdAt).toBeTruthy();
    expect(menu.updatedAt).toBeTruthy();
    expect(menu.items[0]).toEqual({
      id: "legacy-item",
      label: { uk: "Home", en: "", de: "", ru: "" },
      href: "/",
      openInNewTab: false,
      isVisible: true,
      children: [],
    });
    expect(storage.getItem("aio-menus-migration-backup-v0")).not.toBeNull();
  });

  it("preserves malformed JSON in place and creates a backup", async () => {
    const storage = createStorage({ "aio-menus": "{broken-json" });
    stubWindow(storage);

    await expect(getMenus()).resolves.toEqual([]);
    expect(storage.getItem("aio-menus")).toBe("{broken-json");
    expect(storage.getItem("aio-menus-migration-backup-v0")).toBe("{broken-json");
  });
});

describe("menus CRUD", () => {
  it("creates, updates and deletes a menu", async () => {
    stubWindow(createStorage());
    const created = await createMenu({ name: "Main", key: "MAIN", status: "draft", defaultLocale: "en", items: [] });
    expect(created.key).toBe("main");

    const updated = await updateMenu({ id: created.id, name: "Primary", status: "published" });
    expect(updated.name).toBe("Primary");
    expect((await getMenuById(created.id)).status).toBe("published");

    await deleteMenu(created.id);
    await expect(getMenuById(created.id)).rejects.toMatchObject<Partial<MenusApiError>>({ code: "NOT_FOUND" });
  });

  it("rejects duplicate and malformed keys", async () => {
    stubWindow(createStorage());
    const input = { name: "Main", key: "main", status: "draft" as const, defaultLocale: "en" as const, items: [] };
    await createMenu(input);
    await expect(createMenu(input)).rejects.toMatchObject<Partial<MenusApiError>>({ code: "DUPLICATE_KEY" });
    await expect(createMenu({ ...input, key: "Main menu" })).rejects.toMatchObject<Partial<MenusApiError>>({ code: "INVALID_KEY" });
  });

  it("duplicates a menu as an independent draft", async () => {
    stubWindow(createStorage());
    const source = await createMenu({
      name: "Main",
      key: "main",
      status: "published",
      defaultLocale: "en",
      items: [{ id: "item-1", label: createMenuLocalizedText("en", "Home"), href: "/", openInNewTab: false, isVisible: true, children: [] }],
    });

    const duplicate = await duplicateMenu(source.id);

    expect(duplicate).toMatchObject({ name: "Main copy", key: "main-copy", status: "draft" });
    expect(duplicate.id).not.toBe(source.id);
    expect(duplicate.items[0].id).not.toBe(source.items[0].id);
  });

  it("rejects incomplete published menu content at the API boundary", async () => {
    stubWindow(createStorage());
    await expect(createMenu({
      name: "Main", key: "main", status: "published", defaultLocale: "en",
      items: [{ id: "item-1", label: createMenuLocalizedText(), href: "", openInNewTab: false, isVisible: true, children: [] }],
    })).rejects.toMatchObject<Partial<MenusApiError>>({ code: "INVALID_CONTENT" });
  });
});

describe("menu assignment constraints", () => {
  it("migrates legacy assignments with safe defaults", async () => {
    const storage = createStorage({
      "aio-menu-assignments": JSON.stringify([{
        menuId: "menu-1",
        targetType: "category",
        entityId: "beauty",
        region: "content-before",
      }]),
    });
    stubWindow(storage);

    const [assignment] = await getMenuAssignments();

    expect(assignment).toMatchObject({
      menuId: "menu-1",
      target: { type: "category", entityId: "beauty" },
      region: "content-before",
      order: 0,
      isVisible: true,
    });
    expect(assignment.id).toBeTruthy();
    expect(storage.getItem("aio-menu-assignments-migration-backup-v0")).not.toBeNull();
  });

  it("rejects duplicate assignments", async () => {
    const assignment = { id: "assignment-1", menuId: "menu-1", target: { type: "category" as const, entityId: "beauty" }, region: "content-before" as const, order: 0, isVisible: true };
    stubWindow(createStorage({ "aio-menus": JSON.stringify([validMenu]), "aio-menu-assignments": JSON.stringify([assignment]) }));

    await expect(saveMenuAssignment({ ...assignment, id: undefined })).rejects.toMatchObject<Partial<MenusApiError>>({ code: "DUPLICATE_ASSIGNMENT" });
  });

  it("rejects opposite sidebars for the same target", async () => {
    const assignment = { id: "assignment-1", menuId: "menu-1", target: { type: "category" as const, entityId: "beauty" }, region: "sidebar-left" as const, order: 0, isVisible: true };
    stubWindow(createStorage({ "aio-menus": JSON.stringify([validMenu, { ...validMenu, id: "menu-2", key: "secondary" }]), "aio-menu-assignments": JSON.stringify([assignment]) }));

    await expect(saveMenuAssignment({ menuId: "menu-2", target: assignment.target, region: "sidebar-right", order: 1, isVisible: true })).rejects.toMatchObject<Partial<MenusApiError>>({ code: "SIDEBAR_REGION_CONFLICT" });
  });

  it("rejects assignments for a missing menu", async () => {
    stubWindow(createStorage());
    await expect(saveMenuAssignment({
      menuId: "missing",
      target: { type: "global" },
      region: "header",
      order: 0,
      isVisible: true,
    })).rejects.toMatchObject<Partial<MenusApiError>>({ code: "INVALID_MENU" });
  });
});
