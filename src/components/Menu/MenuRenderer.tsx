"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { getMenuLocalizedText, type T_Menu, type T_MenuItem, type T_MenuOrientation, type T_MenuVariant } from "@/entities/menu";
import { useI18n } from "@/shared/i18n";

const MenuItems = ({ items, menu, orientation, variant, onNavigate, level = 0, dropdown = false }: { items: T_MenuItem[]; menu: T_Menu; orientation: T_MenuOrientation; variant: T_MenuVariant; onNavigate?: () => void; level?: number; dropdown?: boolean }) => {
  const { locale } = useI18n();
  const pathname = usePathname();
  const listClass = dropdown
    ? "invisible absolute left-0 top-full z-50 mt-1 min-w-48 space-y-1 rounded-md border border-border bg-surface p-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
    : level > 0
    ? variant === "sidebar"
      ? "ml-3 mt-1 space-y-1 border-l border-border pl-2"
      : "ml-3 mt-1 space-y-1"
    : orientation === "horizontal"
      ? "flex min-w-0 flex-wrap items-center gap-1"
      : "flex min-w-0 flex-col gap-1";
  const linkClass = variant === "compact"
    ? "block rounded px-2 py-1 text-xs text-muted transition hover:bg-surface-muted hover:text-foreground"
    : variant === "sidebar"
      ? "block w-full rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:border-accent hover:bg-accent-soft hover:text-accent"
      : "block rounded-md px-3 py-2 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground";
  const activeClass = variant === "sidebar"
    ? "border-accent bg-accent-soft text-accent"
    : "bg-accent-soft font-semibold text-accent";
  return (
    <ul className={listClass}>
      {items.filter((item) => item.isVisible).map((item) => {
        const label = getMenuLocalizedText(item.label, locale, menu.defaultLocale);
        if (!label || !item.href) return null;
        const external = /^(https?:)?\/\//.test(item.href);
        const normalizedHref = item.href.split(/[?#]/)[0] || "/";
        const isActive = !external && (normalizedHref === "/" ? pathname === "/" : pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`));
        const hasChildren = item.children.some((child) => child.isVisible);
        const itemClass = level === 0 && orientation === "horizontal" && hasChildren ? "group relative" : undefined;
        const content = <>{label}{level === 0 && orientation === "horizontal" && hasChildren && <ChevronDown aria-hidden="true" size={14} className="ml-1 shrink-0" />}</>;
        return (
          <li key={item.id} className={itemClass}>
            {external ? (
              <a className={`${linkClass} inline-flex items-center`} href={item.href} target={item.openInNewTab ? "_blank" : undefined} rel={item.openInNewTab ? "noreferrer" : undefined} onClick={onNavigate}>{content}</a>
            ) : (
              <Link aria-current={isActive ? "page" : undefined} className={`${linkClass} inline-flex items-center ${isActive ? activeClass : ""}`} href={item.href} target={item.openInNewTab ? "_blank" : undefined} onClick={onNavigate}>{content}</Link>
            )}
            {hasChildren && <MenuItems items={item.children} menu={menu} orientation="vertical" variant={variant} onNavigate={onNavigate} level={level + 1} dropdown={level === 0 && orientation === "horizontal"} />}
          </li>
        );
      })}
    </ul>
  );
};

export const MenuRenderer = ({ menu, orientation = "vertical", variant = "default", onNavigate, ariaLabel }: { menu: T_Menu; orientation?: T_MenuOrientation; variant?: T_MenuVariant; onNavigate?: () => void; ariaLabel?: string }) => (
  <nav aria-label={ariaLabel ?? menu.name} data-menu-variant={variant}>
    <MenuItems items={menu.items} menu={menu} orientation={orientation} variant={variant} onNavigate={onNavigate} />
  </nav>
);
