"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { T_Menu, T_MenuAssignment, T_MenuAssignmentTarget, T_MenuRegion } from "@/entities/menu";
import { deleteMenuAssignment, getMenuAssignments, getMenus, MenusApiError, saveMenuAssignment } from "@/shared/api/menus";
import { useI18n } from "@/shared/i18n";
import { Button, Checkbox, Select } from "@/shared/ui";
import { AdminCard } from "@/widgets/AdminWidgets";
import { MenuTargetSelector } from "../MenuTargetSelector";

const regions: T_MenuRegion[] = ["header", "footer", "sidebar-left", "sidebar-right", "content-before", "content-after"];
type T_TargetType = T_MenuAssignmentTarget["type"];
const targetOptions = ["global", "contentPage", "category", "product"] as const;

const matchesTarget = (
  candidate: T_MenuAssignmentTarget,
  target: T_MenuAssignmentTarget,
) =>
  candidate.type === target.type &&
  (candidate.type === "global" ||
    ("entityId" in candidate &&
      "entityId" in target &&
      candidate.entityId === target.entityId));

export const MenuAssignments = ({ menuId }: { menuId: string }) => {
  const { t } = useI18n();
  const [allAssignments, setAllAssignments] = useState<T_MenuAssignment[]>([]);
  const [menus, setMenus] = useState<T_Menu[]>([]);
  const [targetType, setTargetType] = useState<T_TargetType>("global");
  const [entityId, setEntityId] = useState("");
  const [region, setRegion] = useState<T_MenuRegion>("header");
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState("");
  const load = () => void Promise.all([getMenuAssignments(), getMenus()]).then(
    ([nextAssignments, nextMenus]) => {
      setAllAssignments(nextAssignments);
      setMenus(nextMenus);
    },
  );
  useEffect(load, [menuId]);
  const assignments = allAssignments.filter((item) => item.menuId === menuId);
  const selectedTarget: T_MenuAssignmentTarget = targetType === "global"
    ? { type: "global" }
    : { type: targetType, entityId: entityId.trim() };
  const targetAssignments = allAssignments.filter((assignment) =>
    matchesTarget(assignment.target, selectedTarget),
  );
  const hasLeftSidebar = targetAssignments.some(
    (assignment) => assignment.region === "sidebar-left",
  );
  const hasRightSidebar = targetAssignments.some(
    (assignment) => assignment.region === "sidebar-right",
  );
  const occupiedSidebarAssignment = targetAssignments
    .filter(
      (assignment) =>
        assignment.region === "sidebar-left" ||
        assignment.region === "sidebar-right",
    )
    .sort((first, second) => first.order - second.order)[0];
  const occupiedSidebarMenu = occupiedSidebarAssignment
    ? menus.find((menu) => menu.id === occupiedSidebarAssignment.menuId)
    : undefined;
  const availableRegions = regions.filter(
    (value) =>
      !(value === "sidebar-left" && hasRightSidebar) &&
      !(value === "sidebar-right" && hasLeftSidebar),
  );
  const selectedRegion = availableRegions.includes(region)
    ? region
    : availableRegions[0];

  const add = async () => {
    if (targetType !== "global" && !entityId.trim()) {
      setError(t("admin.menus.assignments.entityIdRequired"));
      return;
    }
    const target: T_MenuAssignmentTarget = targetType === "global" ? { type: "global" } : { type: targetType, entityId: entityId.trim() };
    try {
      await saveMenuAssignment({ menuId, target, region: selectedRegion, order: assignments.length, isVisible });
      setError("");
      load();
    } catch (caughtError) {
      setError(
        caughtError instanceof MenusApiError &&
          caughtError.code === "SIDEBAR_REGION_CONFLICT"
          ? t("admin.menus.assignments.sidebarConflict")
          : caughtError instanceof MenusApiError &&
              caughtError.code === "DUPLICATE_ASSIGNMENT"
            ? t("admin.menus.assignments.duplicate")
          : t("admin.menus.assignments.saveFailed"),
      );
    }
  };

  const updateAssignment = async (assignment: T_MenuAssignment) => {
    try {
      await saveMenuAssignment(assignment);
      setError("");
      load();
    } catch {
      setError(t("admin.menus.assignments.saveFailed"));
    }
  };

  const getOrderedSiblings = (assignment: T_MenuAssignment) =>
    allAssignments
      .filter(
        (item) =>
          item.region === assignment.region &&
          matchesTarget(item.target, assignment.target),
      )
      .sort((first, second) => first.order - second.order);

  const moveAssignment = async (
    assignment: T_MenuAssignment,
    direction: -1 | 1,
  ) => {
    const siblings = getOrderedSiblings(assignment);
    const index = siblings.findIndex((item) => item.id === assignment.id);
    const adjacent = siblings[index + direction];
    if (!adjacent) return;

    try {
      await saveMenuAssignment({ ...assignment, order: adjacent.order });
      await saveMenuAssignment({ ...adjacent, order: assignment.order });
      setError("");
      load();
    } catch {
      setError(t("admin.menus.assignments.saveFailed"));
    }
  };
  return <AdminCard title={t("admin.menus.assignments.title")} description={t("admin.menus.assignments.description")}>
    {error && <p role="alert" className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger">{error}</p>}
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
      <Select id="menu-assignment-target" label={t("admin.menus.assignments.target")} value={targetType} onChange={(event) => { setTargetType(event.target.value as T_TargetType); setEntityId(""); setError(""); }} options={targetOptions.map((value) => ({ value, label: t(`admin.menus.assignments.target.${value}`) }))} />
      <Select id="menu-assignment-region" label={t("admin.menus.assignments.region")} value={selectedRegion} onChange={(event) => setRegion(event.target.value as T_MenuRegion)} options={availableRegions.map((value) => ({ value, label: t(`admin.menus.assignments.region.${value}`) }))} />
      <Button type="button" className="self-end" onClick={() => void add()}>{t("admin.menus.assignments.add")}</Button>
    </div>
    {targetType !== "global" && <div className="mt-3"><MenuTargetSelector type={targetType} value={entityId} onChange={(value) => { setEntityId(value); setError(""); }} /></div>}
    {occupiedSidebarAssignment && (
      <p className="mt-3 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-muted">
        {t("admin.menus.assignments.sidebarOccupied", {
          region: t(`admin.menus.assignments.region.${occupiedSidebarAssignment.region}`),
          menu: occupiedSidebarMenu?.name ?? occupiedSidebarAssignment.menuId,
        })}
      </p>
    )}
    <Checkbox className="mt-3" label={t("admin.menus.form.visible")} checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} />
    <div className="mt-4 divide-y divide-border">{assignments.map((item) => {
      const siblings = getOrderedSiblings(item);
      const siblingIndex = siblings.findIndex((assignment) => assignment.id === item.id);
      return <div key={item.id} className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
        <p className="min-w-0 flex-1 text-sm text-foreground">{t(`admin.menus.assignments.target.${item.target.type}`)}{item.target.type !== "global" ? `: ${item.target.entityId}` : ""} · {t(`admin.menus.assignments.region.${item.region}`)}</p>
        <Checkbox label={t("admin.menus.form.visible")} checked={item.isVisible} onChange={(event) => void updateAssignment({ ...item, isVisible: event.target.checked })} />
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" className="flex h-9 w-9 items-center justify-center p-0" disabled={siblingIndex <= 0} aria-label={t("admin.menus.actions.moveUp")} onClick={() => void moveAssignment(item, -1)}><ChevronUp aria-hidden="true" size={18} /></Button>
          <span className="min-w-8 text-center text-xs text-muted">{siblingIndex + 1}</span>
          <Button type="button" variant="ghost" className="flex h-9 w-9 items-center justify-center p-0" disabled={siblingIndex < 0 || siblingIndex >= siblings.length - 1} aria-label={t("admin.menus.actions.moveDown")} onClick={() => void moveAssignment(item, 1)}><ChevronDown aria-hidden="true" size={18} /></Button>
        </div>
        <Button type="button" variant="danger" className="flex h-9 w-9 items-center justify-center p-0" aria-label={t("admin.menus.actions.delete")} onClick={() => void deleteMenuAssignment(item.id).then(load)}><Trash2 aria-hidden="true" size={18} /></Button>
      </div>;
    })}</div>
  </AdminCard>;
};
