"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAccess } from "../../model/useAdminAccess";
import { useI18n } from "@/shared/i18n";
import { AdminLayout } from "@/widgets/AdminWidgets/AdminLayout";

export const AdminAccessGuard = ({ children }: { children: React.ReactNode }) => {
  const { t } = useI18n();
  const pathName = usePathname();
  const { isInitialized, role, canView } = useAdminAccess();

  if (pathName === "/admin/login") return children;

  if (!isInitialized) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted">{t("admin.auth.checking")}</div>;
  }

  if (!role) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-md border border-border bg-surface p-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">{t("admin.auth.requiredTitle")}</h1>
          <p className="mt-2 text-sm text-muted">{t("admin.auth.requiredDescription")}</p>
          <Link className="mt-5 inline-flex h-11 items-center rounded-md bg-accent px-5 font-medium text-background" href={`/admin/login?returnTo=${encodeURIComponent(pathName)}`}>
            {t("admin.auth.signIn")}
          </Link>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-md border border-border bg-surface p-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">{t("admin.auth.forbiddenTitle")}</h1>
          <p className="mt-2 text-sm text-muted">{t("admin.auth.forbiddenDescription")}</p>
          <Link className="mt-5 inline-flex h-11 items-center rounded-md border border-border px-5 font-medium text-foreground" href="/admin">
            {t("admin.auth.backToDashboard")}
          </Link>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};
