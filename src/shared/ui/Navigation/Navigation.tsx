"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "popular", label: "Popular", href: "/popular" },
  { id: "battle", label: "Battle", href: "/battle" },
  { id: "todos", label: "Todos", href: "/todos" },
  { id: "movies", label: "Movies", href: "/movies" },
];

export const Navigation = () => {
  const pathName = usePathname();

  return (
    <nav className="flex items-center gap-4 text-sm">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathName === "/" : pathName.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-1.5 transition ${
              isActive
                ? "bg-accent-soft font-semibold text-accent"
                : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
