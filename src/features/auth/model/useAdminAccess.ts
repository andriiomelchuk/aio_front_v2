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
  const currentModule = getAdminModuleFromPath(pathName);
  const requiresManagePermission =
    pathName === "/admin/products/new" || pathName.endsWith("/edit");
  const moduleEnabled = role === "developer" || developerSettings.modules[currentModule];

  return {
    session,
    role,
    module: currentModule,
    isInitialized,
    isModuleEnabled: moduleEnabled,
    canView: Boolean(role && moduleEnabled && hasAdminPermission(
      role,
      currentModule,
      requiresManagePermission ? "manage" : "view",
    )),
    canManage: Boolean(role && hasAdminPermission(role, currentModule, "manage")),
  };
};
