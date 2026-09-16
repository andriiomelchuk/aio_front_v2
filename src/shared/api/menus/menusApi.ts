import type {
  T_CreateMenuDto,
  T_Menu,
  T_MenuAssignment,
  T_SaveMenuAssignmentDto,
  T_UpdateMenuDto,
} from "@/entities/menu";
import {
  MENU_STORAGE_SCHEMA_VERSION,
  migrateMenuAssignments,
  migrateMenus,
} from "./menuStorageMigrations";
import { MenusApiError } from "./types";

const MENUS_STORAGE_KEY = "aio-menus";
const MENU_ASSIGNMENTS_STORAGE_KEY = "aio-menu-assignments";
const MENU_STORAGE_VERSION_KEY = "aio-menu-storage-version";
const MENU_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const getStorage = () => typeof window === "undefined" ? undefined : window.localStorage;
const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const preserveMigrationBackup = (storage: Storage, key: string, rawValue: string) => {
  const backupKey = `${key}-migration-backup-v0`;
  if (storage.getItem(backupKey) !== null) return;

  try {
    storage.setItem(backupKey, rawValue);
  } catch {
    // Reading remains available even if storage quota prevents a backup.
  }
};

const readMigratedArray = <T>(
  key: string,
  migrate: (value: unknown[], context: { createId: () => string; now: string }) => T[],
): T[] => {
  const storage = getStorage();
  if (!storage) return [];
  const rawValue = storage.getItem(key);
  if (rawValue === null) return [];

  try {
    const value: unknown = JSON.parse(rawValue);
    if (!Array.isArray(value)) {
      preserveMigrationBackup(storage, key, rawValue);
      return [];
    }

    const migrated = migrate(value, {
      createId,
      now: new Date().toISOString(),
    });
    const migratedValue = JSON.stringify(migrated);
    const storedVersion = Number(storage.getItem(MENU_STORAGE_VERSION_KEY) ?? 0);

    if (storedVersion <= MENU_STORAGE_SCHEMA_VERSION && migratedValue !== rawValue) {
      preserveMigrationBackup(storage, key, rawValue);
      storage.setItem(key, migratedValue);
    }
    if (storedVersion <= MENU_STORAGE_SCHEMA_VERSION) {
      storage.setItem(
        MENU_STORAGE_VERSION_KEY,
        String(MENU_STORAGE_SCHEMA_VERSION),
      );
    }

    return migrated;
  } catch {
    preserveMigrationBackup(storage, key, rawValue);
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

const readMenus = () => readMigratedArray<T_Menu>(MENUS_STORAGE_KEY, migrateMenus);
const readAssignments = () =>
  readMigratedArray<T_MenuAssignment>(
    MENU_ASSIGNMENTS_STORAGE_KEY,
    migrateMenuAssignments,
  );

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
