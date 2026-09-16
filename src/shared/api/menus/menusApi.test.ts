import { afterEach, describe, expect, it, vi } from "vitest";
import { createMenuLocalizedText } from "@/entities/menu";
import { createMenu, deleteMenu, getMenuById, getMenus, saveMenuAssignment, updateMenu } from "./menusApi";
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
  it("removes invalid menus and menu items", async () => {
    const menu = { ...validMenu, items: [
      { id: "valid", label: createMenuLocalizedText("en", "Valid"), href: "/", openInNewTab: false, isVisible: true, children: [] },
      { id: "invalid", href: "/broken" },
    ] };
    stubWindow(createStorage({ "aio-menus": JSON.stringify([menu, { id: "broken" }]) }));

    const menus = await getMenus();

    expect(menus).toHaveLength(1);
    expect(menus[0].items).toHaveLength(1);
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
});

describe("menu assignment constraints", () => {
  it("rejects duplicate assignments", async () => {
    const assignment = { id: "assignment-1", menuId: "menu-1", target: { type: "category" as const, entityId: "beauty" }, region: "content-before" as const, order: 0, isVisible: true };
    stubWindow(createStorage({ "aio-menu-assignments": JSON.stringify([assignment]) }));

    await expect(saveMenuAssignment({ ...assignment, id: undefined })).rejects.toMatchObject<Partial<MenusApiError>>({ code: "DUPLICATE_ASSIGNMENT" });
  });

  it("rejects opposite sidebars for the same target", async () => {
    const assignment = { id: "assignment-1", menuId: "menu-1", target: { type: "category" as const, entityId: "beauty" }, region: "sidebar-left" as const, order: 0, isVisible: true };
    stubWindow(createStorage({ "aio-menu-assignments": JSON.stringify([assignment]) }));

    await expect(saveMenuAssignment({ menuId: "menu-2", target: assignment.target, region: "sidebar-right", order: 1, isVisible: true })).rejects.toMatchObject<Partial<MenusApiError>>({ code: "SIDEBAR_REGION_CONFLICT" });
  });
});
