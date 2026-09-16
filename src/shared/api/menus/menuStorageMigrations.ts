import type {
  T_Menu,
  T_MenuAssignment,
  T_MenuAssignmentTarget,
  T_MenuLocalizedText,
} from "@/entities/menu";
import { locales, type T_Locale } from "@/shared/i18n";

export const MENU_STORAGE_SCHEMA_VERSION = 1;

type T_MigrationContext = {
  createId: () => string;
  now: string;
};

const regions: T_MenuAssignment["region"][] = [
  "header",
  "footer",
  "sidebar-left",
  "sidebar-right",
  "content-before",
  "content-after",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isLocale = (value: unknown): value is T_Locale =>
  typeof value === "string" && locales.includes(value as T_Locale);

const migrateLocalizedText = (
  value: unknown,
  defaultLocale: T_Locale,
): T_MenuLocalizedText => {
  const localizedText: T_MenuLocalizedText = {
    uk: "",
    en: "",
    de: "",
    ru: "",
  };

  if (typeof value === "string") {
    localizedText[defaultLocale] = value;
    return localizedText;
  }

  if (!isRecord(value)) return localizedText;

  for (const locale of locales) {
    if (typeof value[locale] === "string") {
      localizedText[locale] = value[locale];
    }
  }

  return localizedText;
};

const migrateMenuItem = (
  value: unknown,
  defaultLocale: T_Locale,
  context: T_MigrationContext,
  depth = 0,
): T_Menu["items"][number] | undefined => {
  if (
    !isRecord(value) ||
    depth > 2 ||
    (typeof value.label !== "string" && !isRecord(value.label))
  ) {
    return undefined;
  }

  const children = Array.isArray(value.children) ? value.children : [];

  return {
    id: typeof value.id === "string" ? value.id : context.createId(),
    label: migrateLocalizedText(value.label, defaultLocale),
    href: typeof value.href === "string" ? value.href : "",
    openInNewTab:
      typeof value.openInNewTab === "boolean" ? value.openInNewTab : false,
    isVisible: typeof value.isVisible === "boolean" ? value.isVisible : true,
    children:
      depth === 2
        ? []
        : children
            .map((child) =>
              migrateMenuItem(child, defaultLocale, context, depth + 1),
            )
            .filter(
              (child): child is T_Menu["items"][number] => Boolean(child),
            ),
  };
};

const createKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const migrateMenus = (
  value: unknown[],
  context: T_MigrationContext,
): T_Menu[] => {
  const usedKeys = new Set<string>();

  return value.flatMap((candidate, index) => {
    if (!isRecord(candidate)) return [];

    const hasName =
      typeof candidate.name === "string" && Boolean(candidate.name.trim());
    const hasKey =
      typeof candidate.key === "string" && Boolean(candidate.key.trim());
    if (!hasName && !hasKey) return [];

    const id = typeof candidate.id === "string" ? candidate.id : context.createId();
    const name =
      hasName
        ? candidate.name as string
        : hasKey
          ? candidate.key as string
          : `Migrated menu ${index + 1}`;
    const keyCandidate =
      hasKey ? candidate.key as string : name;
    const keyBase = createKey(keyCandidate) || `menu-${index + 1}`;
    let key = keyBase;
    let suffix = 2;

    while (usedKeys.has(key)) {
      key = `${keyBase}-${suffix}`;
      suffix += 1;
    }
    usedKeys.add(key);

    const defaultLocale = isLocale(candidate.defaultLocale)
      ? candidate.defaultLocale
      : "uk";
    const items = Array.isArray(candidate.items) ? candidate.items : [];

    return [{
      id,
      name,
      key,
      status:
        candidate.status === "published" || candidate.status === "draft"
          ? candidate.status
          : "draft",
      defaultLocale,
      items: items
        .map((item) => migrateMenuItem(item, defaultLocale, context))
        .filter((item): item is T_Menu["items"][number] => Boolean(item)),
      createdAt:
        typeof candidate.createdAt === "string"
          ? candidate.createdAt
          : context.now,
      updatedAt:
        typeof candidate.updatedAt === "string"
          ? candidate.updatedAt
          : context.now,
    }];
  });
};

const migrateTarget = (
  value: Record<string, unknown>,
): T_MenuAssignmentTarget | undefined => {
  const target = isRecord(value.target) ? value.target : undefined;
  const type = target?.type ?? value.targetType;
  const entityId = target?.entityId ?? value.entityId;

  if (type === "global") return { type: "global" };
  if (
    (type === "contentPage" || type === "category" || type === "product") &&
    typeof entityId === "string"
  ) {
    return { type, entityId };
  }

  return undefined;
};

export const migrateMenuAssignments = (
  value: unknown[],
  context: T_MigrationContext,
): T_MenuAssignment[] =>
  value.flatMap((candidate, index) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.menuId !== "string" ||
      !regions.includes(candidate.region as T_MenuAssignment["region"])
    ) {
      return [];
    }

    const target = migrateTarget(candidate);
    if (!target) return [];

    return [{
      id: typeof candidate.id === "string" ? candidate.id : context.createId(),
      menuId: candidate.menuId,
      target,
      region: candidate.region as T_MenuAssignment["region"],
      order:
        typeof candidate.order === "number" && Number.isFinite(candidate.order)
          ? candidate.order
          : index,
      isVisible:
        typeof candidate.isVisible === "boolean" ? candidate.isVisible : true,
    }];
  });
