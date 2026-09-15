import type { T_Locale } from "@/shared/i18n";

export type T_MenuStatus = "draft" | "published";
export type T_MenuOrientation = "horizontal" | "vertical";
export type T_MenuVariant = "default" | "compact" | "sidebar";
export type T_MenuLocalizedText = Record<T_Locale, string>;

export type T_MenuItem = {
  id: string;
  label: T_MenuLocalizedText;
  href: string;
  openInNewTab: boolean;
  isVisible: boolean;
  children: T_MenuItem[];
};

export type T_Menu = {
  id: string;
  name: string;
  key: string;
  status: T_MenuStatus;
  defaultLocale: T_Locale;
  items: T_MenuItem[];
  createdAt: string;
  updatedAt: string;
};

export type T_CreateMenuDto = Omit<T_Menu, "id" | "createdAt" | "updatedAt">;
export type T_UpdateMenuDto = Partial<Omit<T_Menu, "id" | "createdAt" | "updatedAt">> & { id: string };

export type T_MenuAssignmentTarget =
  | { type: "global" }
  | { type: "contentPage"; entityId: string }
  | { type: "category"; entityId: string }
  | { type: "product"; entityId: string };

export type T_MenuRegion =
  | "header"
  | "footer"
  | "sidebar-left"
  | "sidebar-right"
  | "content-before"
  | "content-after";

export type T_MenuAssignment = {
  id: string;
  menuId: string;
  target: T_MenuAssignmentTarget;
  region: T_MenuRegion;
  order: number;
  isVisible: boolean;
};

export type T_SaveMenuAssignmentDto = Omit<T_MenuAssignment, "id"> & { id?: string };
