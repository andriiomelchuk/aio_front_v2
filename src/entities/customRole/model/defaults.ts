import { locales } from "@/shared/i18n";
import type { T_SaveCustomRoleDto } from "./types";

export const createEmptyCustomRole = (): T_SaveCustomRoleDto => ({
  key: "",
  status: "active",
  translations: Object.fromEntries(locales.map((locale) => [locale, { name: "", description: "" }])) as T_SaveCustomRoleDto["translations"],
  permissions: {},
  restrictions: { branches: [], warehouses: [], serviceCategories: [], ownRecordsOnly: false },
});
