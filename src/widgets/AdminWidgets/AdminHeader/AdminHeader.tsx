"use client";
import { usePathname } from "next/navigation";
import { adminNavigation } from "../model/adminNavigation";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const pathName = usePathname();

  const pageMeta = adminNavigation.find((item) =>
    item.href === "/admin"
      ? pathName === "/admin"
      : pathName.startsWith(item.href),
  ) ?? {
    title: "admin panel",
    description: "Management application data",
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-foreground">
            {pageMeta.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{pageMeta.description}</p>
        </div>
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-surface-muted lg:hidden"
          aria-label="Open admin menu"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="absolute block h-0.5 w-5 -translate-y-1.5 bg-current" />
          <span className="absolute block h-0.5 w-5 translate-y-1.5 bg-current" />
        </button>
      </div>
    </header>
  );
};
