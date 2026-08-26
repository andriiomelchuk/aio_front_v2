"use client";

import { useState } from "react";

import { LanguageSwitcher } from "@/shared/ui";
import { Navigation } from "@/shared/ui/Navigation";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="relative z-40 h-[var(--header-height)] border-b border-border bg-surface">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 text-sm font-semibold text-foreground">
          AIO Front
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Navigation />
          <LanguageSwitcher variant="compact" mode="select" />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-surface-muted md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
        >
          <span className="relative block h-4 w-5">
            <span className="absolute left-0 top-0 block h-0.5 w-5 bg-current" />
            <span className="absolute left-0 top-1.5 block h-0.5 w-5 bg-current" />
            <span className="absolute left-0 top-3 block h-0.5 w-5 bg-current" />
          </span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-border bg-surface px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-4">
            <Navigation direction="column" onNavigate={closeMenu} />

            <div className="border-t border-border pt-4">
              <LanguageSwitcher variant="flag" mode="buttons" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
