import { getCustomRole } from "@/shared/api/customRoles";
import type { T_I18nContext, T_I18nKey, T_Locale } from "@/shared/i18n";
import type { T_StaffRole } from "./adminRoles";

export const getStaffRoleLabel = (role: T_StaffRole, locale: T_Locale, t: T_I18nContext["t"]) => {
  if (role.startsWith("custom:")) {
    const customRole = getCustomRole(role);
    return customRole?.translations[locale].name || customRole?.translations.uk.name || customRole?.key || role;
  }
  return t(`admin.auth.role.${role}` as T_I18nKey);
};
