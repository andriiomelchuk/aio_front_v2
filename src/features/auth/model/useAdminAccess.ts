"use client";

import { usePathname } from "next/navigation";
import { getAdminModuleFromPath, hasAdminPermission, isStaffRole } from "@/shared/config/adminPermissions";
import { useAppSelector } from "@/shared/store/hooks";
import { useDeveloperSettings } from "@/shared/developerSettings";

export const useAdminAccess = () => {
  const pathName = usePathname();
  const { session, isInitialized } = useAppSelector((state) => state.auth);
  const developerSettings = useDeveloperSettings();
  const role = session && isStaffRole(session.role) ? session.role : null;
  const roles = session?.roles?.filter(isStaffRole) ?? (role ? [role] : []);
  const currentModule = getAdminModuleFromPath(pathName);
  const routePermission = pathName.endsWith("/new")
    ? "create"
    : pathName.endsWith("/edit")
      ? "edit"
      : "view";
  const moduleEnabled = role === "developer" || developerSettings.modules[currentModule];

  return {
    session,
    role,
    roles,
    module: currentModule,
    isInitialized,
    isModuleEnabled: moduleEnabled,
    canView: Boolean(role && moduleEnabled && roles.some((item) => hasAdminPermission(item, currentModule, routePermission))),
    canManage: Boolean(role && moduleEnabled && roles.some((item) => hasAdminPermission(item, currentModule, "manage"))),
    can: (permission: Parameters<typeof hasAdminPermission>[2], module = currentModule) => Boolean(role && moduleEnabled && roles.some((item) => hasAdminPermission(item, module, permission))),
  };
};
