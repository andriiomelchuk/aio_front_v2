"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

import { useAuth } from "@/features/auth";
import { useI18n } from "@/shared/i18n";
import { Button, LanguageSwitcher, ManagedImage, useToast } from "@/shared/ui";
import { Navigation } from "@/shared/ui/Navigation";
import { siteNavigation } from "./model/SiteNavigation";
import { HeaderActions } from "./HeaderActions";
import { AssignedMenu } from "@/components/Menu";
import { useSiteSettings } from "@/shared/siteSettings";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useI18n();
  const { session, isInitialized, logout } = useAuth();
  const { showToast } = useToast();
  const settings = useSiteSettings();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    showToast({ message: t("auth.notification.loggedOut"), variant: "info" });
  };

  const authControls = isInitialized && (
    session ? (
      <div className="flex min-w-0 items-center gap-2">
        <Link href={session.role === "customer" ? "/account" : "/admin"} className="flex min-w-0 items-center gap-2 text-sm text-foreground hover:text-accent" onClick={closeMenu}>
          <UserRound aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="max-w-32 truncate">{session.displayName}</span>
        </Link>
        <Button
          variant="ghost"
          className="flex h-9 w-9 items-center justify-center p-0"
          aria-label={t("auth.logout")}
          onClick={handleLogout}
        >
          <LogOut aria-hidden="true" className="h-5 w-5" />
        </Button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Link className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted" href="/login" onClick={closeMenu}>
          {t("auth.login.action")}
        </Link>
        <Link className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-background hover:opacity-85" href="/register" onClick={closeMenu}>
          {t("auth.register.action")}
        </Link>
      </div>
    )
  );

  return (
    <header className="relative z-40 h-[var(--header-height)] border-b border-border bg-surface">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
          {settings.general.logoUrl && (
            <ManagedImage src={settings.general.logoUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-md object-cover" />
          )}
          {settings.general.siteName}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <AssignedMenu target={{ type: "global" }} region="header" orientation="horizontal" fallback={<Navigation items={siteNavigation}/>} loadingFallback={<div className="invisible"><Navigation items={siteNavigation}/></div>} />
          <HeaderActions />
          {authControls}
          <LanguageSwitcher variant="compact" mode="select" />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <HeaderActions onNavigate={closeMenu} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-surface-muted"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={t("header.openMenu")}
            aria-expanded={isMenuOpen}
          >
            <span className="relative block h-4 w-5">
              <span className="absolute left-0 top-0 block h-0.5 w-5 bg-current" />
              <span className="absolute left-0 top-1.5 block h-0.5 w-5 bg-current" />
              <span className="absolute left-0 top-3 block h-0.5 w-5 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-border bg-surface px-4 py-4 shadow-lg lg:hidden">
          <div className="flex flex-col gap-4">
            <AssignedMenu target={{ type: "global" }} region="header" orientation="vertical" onNavigate={closeMenu} fallback={<Navigation items={siteNavigation} direction="column" onNavigate={closeMenu} />} />

            {authControls}

            <div className="border-t border-border pt-4">
              <LanguageSwitcher variant="flag" mode="buttons" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
