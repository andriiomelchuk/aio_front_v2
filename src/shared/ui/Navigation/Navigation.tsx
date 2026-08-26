"use client";

import type { T_I18nKey } from "@/shared/i18n";
import { useI18n } from "@/shared/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { T_NavigationProps } from "./styles";

type T_NavItem = {
  id: string;
  labelKey: T_I18nKey;
  href: string;
};

const navItems: T_NavItem[] = [
  { id: "home", labelKey: "nav.home", href: "/" },
  { id: "popular", labelKey: "nav.popular", href: "/popular" },
  { id: "battle", labelKey: "nav.battle", href: "/battle" },
  { id: "movies", labelKey: "nav.movies", href: "/movies" },
];



export const Navigation = ({
  direction = "row",
  onNavigate,
}: T_NavigationProps) => {
  const pathName = usePathname();
  const { t } = useI18n();

  const navClass =
    direction === "column"
      ? "flex flex-col gap-2 text-sm"
      : "flex items-center gap-4 text-sm";

  return (
    <nav className={navClass}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathName === "/" : pathName.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-md px-3 py-2 transition ${
              isActive
                ? "bg-accent-soft font-semibold text-accent"
                : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
};
