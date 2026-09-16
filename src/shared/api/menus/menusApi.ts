import type {
  T_CreateMenuDto,
  T_Menu,
  T_MenuAssignment,
  T_SaveMenuAssignmentDto,
  T_UpdateMenuDto,
} from "@/entities/menu";
import { locales } from "@/shared/i18n";
import { MenusApiError } from "./types";

const MENUS_STORAGE_KEY = "aio-menus";
const MENU_ASSIGNMENTS_STORAGE_KEY = "aio-menu-assignments";
const MENU_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const getStorage = () => typeof window === "undefined" ? undefined : window.localStorage;
const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeLocalizedText = (value: unknown) => {
  if (!isRecord(value)) return undefined;
  if (!locales.every((locale) => typeof value[locale] === "string")) return undefined;
  return { uk: value.uk as string, en: value.en as string, de: value.de as string, ru: value.ru as string };
};

const normalizeMenuItem = (value: unknown, depth = 0): T_Menu["items"][number] | undefined => {
  if (!isRecord(value) || depth > 2) return undefined;
  const label = normalizeLocalizedText(value.label);
  if (!label || typeof value.id !== "string" || typeof value.href !== "string" || typeof value.openInNewTab !== "boolean" || typeof value.isVisible !== "boolean" || !Array.isArray(value.children)) return undefined;
  return {
    id: value.id,
    label,
    href: value.href,
    openInNewTab: value.openInNewTab,
    isVisible: value.isVisible,
    children: depth === 2 ? [] : value.children.map((item) => normalizeMenuItem(item, depth + 1)).filter((item): item is T_Menu["items"][number] => Boolean(item)),
  };
};

const normalizeMenu = (value: unknown): T_Menu | undefined => {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string" || typeof value.key !== "string" || (value.status !== "draft" && value.status !== "published") || !locales.includes(value.defaultLocale as (typeof locales)[number]) || !Array.isArray(value.items) || typeof value.createdAt !== "string" || typeof value.updatedAt !== "string") return undefined;
  return {
    id: value.id,
    name: value.name,
    key: value.key,
    status: value.status,
    defaultLocale: value.defaultLocale as T_Menu["defaultLocale"],
    items: value.items.map((item) => normalizeMenuItem(item)).filter((item): item is T_Menu["items"][number] => Boolean(item)),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
};

const normalizeAssignment = (value: unknown): T_MenuAssignment | undefined => {
  if (!isRecord(value) || !isRecord(value.target) || typeof value.id !== "string" || typeof value.menuId !== "string" || typeof value.order !== "number" || typeof value.isVisible !== "boolean") return undefined;
  const regions: T_MenuAssignment["region"][] = ["header", "footer", "sidebar-left", "sidebar-right", "content-before", "content-after"];
  if (!regions.includes(value.region as T_MenuAssignment["region"])) return undefined;
  const targetType = value.target.type;
  if (targetType !== "global" && targetType !== "contentPage" && targetType !== "category" && targetType !== "product") return undefined;
  if (targetType !== "global" && typeof value.target.entityId !== "string") return undefined;
  return {
    id: value.id,
    menuId: value.menuId,
    target: targetType === "global" ? { type: "global" } : { type: targetType, entityId: value.target.entityId as string },
    region: value.region as T_MenuAssignment["region"],
    order: value.order,
    isVisible: value.isVisible,
  };
};

const readArray = <T>(key: string, normalize: (value: unknown) => T | undefined): T[] => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const value: unknown = JSON.parse(storage.getItem(key) ?? "[]");
    if (!Array.isArray(value)) {
      storage.removeItem(key);
      return [];
    }
    const normalized = value.map(normalize).filter((item): item is T => Boolean(item));
    const normalizedValue = JSON.stringify(normalized);
    if (normalizedValue !== JSON.stringify(value)) storage.setItem(key, normalizedValue);
    return normalized;
  } catch {
    storage.removeItem(key);
    return [];
  }
};

const writeArray = <T>(key: string, value: T[]) => {
  const storage = getStorage();
  if (!storage) throw new MenusApiError("STORAGE_UNAVAILABLE", "Menu storage is unavailable");
  try {
    storage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("aio-menus-change"));
  } catch {
    throw new MenusApiError("STORAGE_WRITE_FAILED", "Could not save menus");
  }
};

const normalizeKey = (key: string) => key.trim().toLowerCase();
const validateKey = (menus: T_Menu[], key: string, ignoredId?: string) => {
  const normalizedKey = normalizeKey(key);
  if (!MENU_KEY_PATTERN.test(normalizedKey)) throw new MenusApiError("INVALID_KEY", "Menu key is invalid");
  if (menus.some((menu) => menu.id !== ignoredId && menu.key === normalizedKey)) {
    throw new MenusApiError("DUPLICATE_KEY", "Menu key already exists");
  }
  return normalizedKey;
};

const targetsMatch = (
  first: T_MenuAssignment["target"],
  second: T_MenuAssignment["target"],
) =>
  first.type === second.type &&
  (first.type === "global" ||
    ("entityId" in first &&
      "entityId" in second &&
      first.entityId === second.entityId));

const readMenus = () => readArray<T_Menu>(MENUS_STORAGE_KEY, normalizeMenu);
const readAssignments = () => readArray<T_MenuAssignment>(MENU_ASSIGNMENTS_STORAGE_KEY, normalizeAssignment);

export const getMenus = async (): Promise<T_Menu[]> => readMenus();

export const getMenuById = async (id: string): Promise<T_Menu> => {
  const menu = readMenus().find((item) => item.id === id);
  if (!menu) throw new MenusApiError("NOT_FOUND", "Menu not found");
  return menu;
};

export const getMenuByKey = async (key: string): Promise<T_Menu> => {
  const menu = readMenus().find((item) => item.key === normalizeKey(key));
  if (!menu) throw new MenusApiError("NOT_FOUND", "Menu not found");
  return menu;
};

export const createMenu = async (input: T_CreateMenuDto): Promise<T_Menu> => {
  const menus = readMenus();
  const timestamp = new Date().toISOString();
  const menu: T_Menu = { ...input, id: createId(), key: validateKey(menus, input.key), createdAt: timestamp, updatedAt: timestamp };
  writeArray(MENUS_STORAGE_KEY, [menu, ...menus]);
  return menu;
};

export const updateMenu = async (input: T_UpdateMenuDto): Promise<T_Menu> => {
  const menus = readMenus();
  const index = menus.findIndex((item) => item.id === input.id);
  if (index < 0) throw new MenusApiError("NOT_FOUND", "Menu not found");
  const current = menus[index];
  const menu: T_Menu = { ...current, ...input, id: current.id, key: input.key ? validateKey(menus, input.key, current.id) : current.key, createdAt: current.createdAt, updatedAt: new Date().toISOString() };
  const next = [...menus];
  next[index] = menu;
  writeArray(MENUS_STORAGE_KEY, next);
  return menu;
};

export const deleteMenu = async (id: string): Promise<string> => {
  const menus = readMenus();
  if (!menus.some((item) => item.id === id)) throw new MenusApiError("NOT_FOUND", "Menu not found");
  writeArray(MENUS_STORAGE_KEY, menus.filter((item) => item.id !== id));
  writeArray(MENU_ASSIGNMENTS_STORAGE_KEY, readAssignments().filter((item) => item.menuId !== id));
  return id;
};

export const getMenuAssignments = async (): Promise<T_MenuAssignment[]> => readAssignments();

export const saveMenuAssignment = async (input: T_SaveMenuAssignmentDto): Promise<T_MenuAssignment> => {
  const assignments = readAssignments();
  if (assignments.some((assignment) => assignment.id !== input.id && assignment.menuId === input.menuId && assignment.region === input.region && targetsMatch(assignment.target, input.target))) {
    throw new MenusApiError("DUPLICATE_ASSIGNMENT", "This menu assignment already exists");
  }
  const oppositeSidebarRegion = input.region === "sidebar-left"
    ? "sidebar-right"
    : input.region === "sidebar-right"
      ? "sidebar-left"
      : undefined;

  if (
    oppositeSidebarRegion &&
    assignments.some(
      (assignment) =>
        assignment.id !== input.id &&
        assignment.region === oppositeSidebarRegion &&
        targetsMatch(assignment.target, input.target),
    )
  ) {
    throw new MenusApiError(
      "SIDEBAR_REGION_CONFLICT",
      "The opposite sidebar region is already assigned to this target",
    );
  }

  const assignment: T_MenuAssignment = { ...input, id: input.id ?? createId() };
  const next = assignments.filter((item) => item.id !== assignment.id);
  writeArray(MENU_ASSIGNMENTS_STORAGE_KEY, [...next, assignment]);
  return assignment;
};

export const deleteMenuAssignment = async (id: string): Promise<string> => {
  writeArray(MENU_ASSIGNMENTS_STORAGE_KEY, readAssignments().filter((item) => item.id !== id));
  return id;
};
