"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminNavigation } from "../model/adminNavigation";
import { useI18n } from "@/shared/i18n";

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const { t } = useI18n();
  const pathName = usePathname();

  const adminNavigation = getAdminNavigation(t);

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />
      <aside
        className={[
          "fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-border bg-surface px-5 py-6 transition-transform lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-foreground">
              Admin Panel
            </p>
            <p className="mt-1 text-sm text-muted">Management area</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-surface-muted lg:hidden"
            aria-label="Close admin menu"
          >
            ×
          </button>
        </div>

        <nav aria-label="Admin navigation">
          <ul className="space-y-1">
            {adminNavigation.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathName === "/admin"
                  : pathName.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={[
                      "block rounded-md px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-accent-soft text-accent"
                        : "text-muted hover:bg-surface-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="ml-3 text-xs font-semibold"
                        aria-hidden="true"
                      >
                        {"<<<"}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};
