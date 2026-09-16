import type { T_MenuItem } from "@/entities/menu";
import type { T_Locale } from "@/shared/i18n";

export const isMenuItemComplete = (
  item: T_MenuItem,
  locale: T_Locale,
): boolean =>
  Boolean(item.label[locale].trim() && item.href.trim()) &&
  item.children.every((child) => isMenuItemComplete(child, locale));
