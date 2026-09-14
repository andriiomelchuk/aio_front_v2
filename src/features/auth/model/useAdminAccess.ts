"use client";

import { usePathname } from "next/navigation";
import { getAdminModuleFromPath, hasAdminPermission, isStaffRole } from "@/shared/config/adminPermissions";
import { useAppSelector } from "@/shared/store/hooks";

export const useAdminAccess = () => {
  const pathName = usePathname();
  const { session, isInitialized } = useAppSelector((state) => state.auth);
  const role = session && isStaffRole(session.role) ? session.role : null;
  const currentModule = getAdminModuleFromPath(pathName);
  const requiresManagePermission =
    pathName === "/admin/products/new" || pathName.endsWith("/edit");

  return {
    session,
    role,
    module: currentModule,
    isInitialized,
    canView: Boolean(role && hasAdminPermission(
      role,
      currentModule,
      requiresManagePermission ? "manage" : "view",
    )),
    canManage: Boolean(role && hasAdminPermission(role, currentModule, "manage")),
  };
};
