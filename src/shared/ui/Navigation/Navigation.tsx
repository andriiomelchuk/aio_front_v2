"use client";

import { useI18n } from "@/shared/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { T_NavigationProps } from "./types";






export const Navigation = ({
  items = [],
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
      {items.map((item) => {
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
