"use client";

import { useEffect, useState } from "react";
import type { T_MenuBlock, T_ContentPageLocale } from "@/entities/contentPage";
import type { T_Menu } from "@/entities/menu";
import { getMenus } from "@/shared/api/menus";
import { useI18n } from "@/shared/i18n";
import { Select } from "@/shared/ui";
import { LocalizedField } from "../LocalizedField";

export const MenuBlockEditor = ({ block, activeLocale, onChange }: { block: T_MenuBlock; activeLocale: T_ContentPageLocale; onChange: (block: T_MenuBlock) => void }) => {
  const { t } = useI18n();
  const [menus, setMenus] = useState<T_Menu[]>([]);
  useEffect(() => { void getMenus().then(setMenus); }, []);
  return <>
    <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.title")} value={block.data.title} onChange={(title) => onChange({ ...block, data: { ...block.data, title } })} />
    <Select label={t("admin.contentPages.block.menu")} value={block.data.menuId} onChange={(event) => onChange({ ...block, data: { ...block.data, menuId: event.target.value } })} options={[{ value: "", label: t("admin.contentPages.block.selectMenu") }, ...menus.map((menu) => ({ value: menu.id, label: menu.name }))]} />
    <Select label={t("admin.contentPages.block.menuOrientation")} value={block.data.orientation} onChange={(event) => onChange({ ...block, data: { ...block.data, orientation: event.target.value as T_MenuBlock["data"]["orientation"] } })} options={[{ value: "vertical", label: t("admin.contentPages.block.vertical") }, { value: "horizontal", label: t("admin.contentPages.block.horizontal") }]} />
    <Select label={t("admin.contentPages.block.menuVariant")} value={block.data.variant} onChange={(event) => onChange({ ...block, data: { ...block.data, variant: event.target.value as T_MenuBlock["data"]["variant"] } })} options={[{ value: "default", label: t("admin.contentPages.block.variantDefault") }, { value: "compact", label: t("admin.contentPages.block.variantCompact") }, { value: "sidebar", label: t("admin.contentPages.block.variantSidebar") }]} />
  </>;
};
