"use client";

import { useEffect, useState } from "react";
import type { T_MenuAssignmentTarget, T_MenuRegion } from "@/entities/menu";
import { getMenuAssignments, getMenus } from "@/shared/api/menus";
import { useI18n } from "@/shared/i18n";
import { AssignedMenu } from "./AssignedMenu";

const matchesTarget = (
  candidate: T_MenuAssignmentTarget,
  target: T_MenuAssignmentTarget,
) =>
  candidate.type === target.type &&
  (candidate.type === "global" ||
    ("entityId" in candidate &&
      "entityId" in target &&
      candidate.entityId === target.entityId));

export const AssignedMenuLayout = ({
  target,
  children,
}: {
  target: T_MenuAssignmentTarget;
  children: React.ReactNode;
}) => {
  const { t } = useI18n();
  const [visibleRegions, setVisibleRegions] = useState<Set<T_MenuRegion>>(
    () => new Set(),
  );
  const targetType = target.type;
  const targetEntityId = "entityId" in target ? target.entityId : undefined;

  useEffect(() => {
    const loadVisibleRegions = async () => {
      const [menus, assignments] = await Promise.all([
        getMenus(),
        getMenuAssignments(),
      ]);
      const publishedMenuIds = new Set(
        menus
          .filter((menu) => menu.status === "published")
          .map((menu) => menu.id),
      );
      const stableTarget: T_MenuAssignmentTarget =
        targetType === "global"
          ? { type: "global" }
          : { type: targetType, entityId: targetEntityId ?? "" };

      const matchingAssignments = assignments
        .filter(
          (assignment) =>
            assignment.isVisible &&
            publishedMenuIds.has(assignment.menuId) &&
            (matchesTarget(assignment.target, stableTarget) ||
              ((assignment.region === "content-before" || assignment.region === "content-after") &&
                stableTarget.type !== "global" && assignment.target.type === "global")),
        )
        .sort((first, second) => first.order - second.order);
      const selectedSidebar = matchingAssignments.find(
        (assignment) =>
          assignment.region === "sidebar-left" ||
          assignment.region === "sidebar-right",
      );
      const regions = matchingAssignments
        .filter(
          (assignment) =>
            assignment.region !== "sidebar-left" &&
            assignment.region !== "sidebar-right",
        )
        .map((assignment) => assignment.region);

      if (selectedSidebar) {
        regions.push(selectedSidebar.region);
      }

      setVisibleRegions(new Set(regions));
    };

    void loadVisibleRegions();
    window.addEventListener("aio-menus-change", loadVisibleRegions);

    return () =>
      window.removeEventListener("aio-menus-change", loadVisibleRegions);
  }, [targetEntityId, targetType]);

  const hasLeftSidebar = visibleRegions.has("sidebar-left");
  const hasRightSidebar = visibleRegions.has("sidebar-right");
  const columnsClass = hasLeftSidebar
    ? "2xl:grid-cols-[13rem_minmax(0,1fr)]"
    : hasRightSidebar
      ? "2xl:grid-cols-[minmax(0,1fr)_13rem]"
        : "grid-cols-1";

  return (
    <div className="space-y-4">
      <AssignedMenu target={target} region="content-before" orientation="horizontal" />
      <div className={`grid min-w-0 gap-6 ${columnsClass}`}>
        {hasLeftSidebar && (
          <aside className="hidden min-w-0 rounded-md border border-border bg-surface p-3 2xl:block">
            <AssignedMenu target={target} region="sidebar-left" variant="sidebar" />
          </aside>
        )}
        <div className="min-w-0">
          {children}
        </div>
        {hasRightSidebar && (
          <aside className="hidden min-w-0 rounded-md border border-border bg-surface p-3 2xl:block">
            <AssignedMenu target={target} region="sidebar-right" variant="sidebar" />
          </aside>
        )}
      </div>
      {(hasLeftSidebar || hasRightSidebar) && (
        <div className="grid gap-3 2xl:hidden sm:grid-cols-2">
          {hasLeftSidebar && (
            <details className="rounded-md border border-border bg-surface p-3">
              <summary className="cursor-pointer select-none text-sm font-semibold text-foreground">
                {t("navigation.additionalLeft")}
              </summary>
              <div className="mt-2 border-t border-border pt-2">
                <AssignedMenu target={target} region="sidebar-left" variant="sidebar" />
              </div>
            </details>
          )}
          {hasRightSidebar && (
            <details className="rounded-md border border-border bg-surface p-3">
              <summary className="cursor-pointer select-none text-sm font-semibold text-foreground">
                {t("navigation.additionalRight")}
              </summary>
              <div className="mt-2 border-t border-border pt-2">
                <AssignedMenu target={target} region="sidebar-right" variant="sidebar" />
              </div>
            </details>
          )}
        </div>
      )}
      <AssignedMenu target={target} region="content-after" orientation="horizontal" />
    </div>
  );
};
