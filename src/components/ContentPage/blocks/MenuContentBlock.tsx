"use client";

import { useEffect, useState } from "react";
import { getLocalizedText, type T_MenuBlock, type T_ContentPageLocale } from "@/entities/contentPage";
import type { T_Menu } from "@/entities/menu";
import { MenuRenderer } from "@/components/Menu";
import { getMenuById } from "@/shared/api/menus";

export const MenuContentBlock = ({ block, locale, defaultLocale }: { block: T_MenuBlock; preview?: boolean; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const [menu, setMenu] = useState<T_Menu | null>(null);
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const value = block.data.menuId ? await getMenuById(block.data.menuId) : null;
        setMenu(value?.status === "published" ? value : null);
      } catch {
        setMenu(null);
      }
    };
    void loadMenu();
  }, [block.data.menuId]);
  if (!menu) return null;
  const title = getLocalizedText(block.data.title, locale, defaultLocale);
  return <section className="mx-auto w-full max-w-7xl px-4 py-6"><div className="border-y border-border py-4">{title && <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>}<MenuRenderer menu={menu} orientation={block.data.orientation} variant={block.data.variant} /></div></section>;
};
