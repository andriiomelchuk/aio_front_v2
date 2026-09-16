"use client";

import { useEffect, useState } from "react";
import type { T_Menu, T_MenuAssignmentTarget, T_MenuOrientation, T_MenuRegion, T_MenuVariant } from "@/entities/menu";
import { getMenuAssignments, getMenus } from "@/shared/api/menus";
import { MenuRenderer } from "./MenuRenderer";

const matchesTarget = (candidate: T_MenuAssignmentTarget, target: T_MenuAssignmentTarget) =>
  candidate.type === target.type && (candidate.type === "global" || ("entityId" in candidate && "entityId" in target && candidate.entityId === target.entityId));

const matchesAssignmentTarget = (candidate: T_MenuAssignmentTarget, target: T_MenuAssignmentTarget, region: T_MenuRegion) =>
  matchesTarget(candidate, target) ||
  ((region === "content-before" || region === "content-after") &&
    target.type !== "global" && candidate.type === "global");

export const AssignedMenu = ({ target, region, orientation, variant, onNavigate, fallback = null, loadingFallback = null }: { target: T_MenuAssignmentTarget; region: T_MenuRegion; orientation?: T_MenuOrientation; variant?: T_MenuVariant; onNavigate?: () => void; fallback?: React.ReactNode; loadingFallback?: React.ReactNode }) => {
  const [menus, setMenus] = useState<T_Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const targetType = target.type;
  const targetEntityId = "entityId" in target ? target.entityId : undefined;
  useEffect(() => {
    const load = async () => {
      const [allMenus, assignments] = await Promise.all([getMenus(), getMenuAssignments()]);
      const stableTarget: T_MenuAssignmentTarget = targetType === "global" ? { type: "global" } : { type: targetType, entityId: targetEntityId ?? "" };
      const ids = assignments.filter((item) => item.isVisible && item.region === region && matchesAssignmentTarget(item.target, stableTarget, region)).sort((a, b) => a.order - b.order).map((item) => item.menuId);
      setMenus(ids.map((id) => allMenus.find((menu) => menu.id === id)).filter((menu): menu is T_Menu => Boolean(menu && menu.status === "published")));
      setIsLoading(false);
    };
    void load();
    window.addEventListener("aio-menus-change", load);
    return () => window.removeEventListener("aio-menus-change", load);
  }, [region, targetEntityId, targetType]);
  if (isLoading) return loadingFallback;
  if (menus.length === 0) return fallback;
  return <div className="space-y-2">{menus.map((menu) => <MenuRenderer key={menu.id} menu={menu} orientation={orientation} variant={variant} onNavigate={onNavigate} />)}</div>;
};
