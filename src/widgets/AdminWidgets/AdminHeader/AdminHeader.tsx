"use client";
import { usePathname, useRouter } from "next/navigation";
import { getAdminNavigation } from "../model/adminNavigation";
import { LanguageSwitcher } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { useAdminAccess, useAuth } from "@/features/auth";
import { Button } from "@/shared/ui";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {

  const { t } = useI18n();
  const pathName = usePathname();
  const router = useRouter();
  const { role } = useAdminAccess();
  const { logout } = useAuth();

  const adminNavigation = getAdminNavigation(t);

  const pageMeta = adminNavigation.find((item) =>
    item.href === "/admin"
      ? pathName === "/admin"
      : pathName.startsWith(item.href),
  ) ?? {
    title: t("admin.header.title"),
    description: t("admin.header.description"),
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-lg font-semibold text-foreground sm:truncate">
            {pageMeta.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{pageMeta.description}</p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
          {role && (
            <span className="hidden rounded-md border border-border px-3 py-2 text-xs font-semibold uppercase text-muted sm:inline-flex">
              {t(`admin.auth.role.${role}`)}
            </span>
          )}
          <LanguageSwitcher variant="flag" mode="buttons"/>
          <Button
            type="button"
            variant="secondary"
            className="h-10 px-3 text-sm"
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
          >
            {t("admin.auth.logout")}
          </Button>
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-surface-muted lg:hidden"
            aria-label={t("admin.header.ariaLabel.openAdminMenu")}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="absolute block h-0.5 w-5 -translate-y-1.5 bg-current" />
            <span className="absolute block h-0.5 w-5 translate-y-1.5 bg-current" />
          </button>
        </div>
      </div>
    </header>
  );
};
