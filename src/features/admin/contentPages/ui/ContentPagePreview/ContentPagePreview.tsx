"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { T_ContentPageLocale, T_PageBlock } from "@/entities/contentPage";
import { ContentPageBlocks } from "@/components/ContentPage";
import { useI18n } from "@/shared/i18n";

type T_PreviewMode = "desktop" | "tablet" | "mobile";

const previewWidths: Record<T_PreviewMode, string> = {
  desktop: "w-full",
  tablet: "w-full max-w-[768px]",
  mobile: "w-full max-w-[390px]",
};

const previewModes = [
  { mode: "desktop", Icon: Monitor },
  { mode: "tablet", Icon: Tablet },
  { mode: "mobile", Icon: Smartphone },
] as const;

export const ContentPagePreview = ({ blocks, locale, defaultLocale }: { blocks: T_PageBlock[]; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<T_PreviewMode>("desktop");
  const visibleBlocks = blocks.filter((block) => block.isVisible);

  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="font-semibold text-foreground">
            {t("admin.contentPages.preview.title")}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {t("admin.contentPages.preview.description")}
          </p>
        </div>
        <div className="flex rounded-md border border-border bg-background p-1" role="group" aria-label={t("admin.contentPages.preview.deviceLabel")}>
          {previewModes.map(({ mode: previewMode, Icon }) => {
            const label = t(`admin.contentPages.preview.${previewMode}`);

            return (
              <button
                key={previewMode}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={mode === previewMode}
                className={`flex h-9 w-9 items-center justify-center rounded-md transition ${mode === previewMode ? "bg-accent text-background" : "text-muted hover:bg-surface-muted hover:text-foreground"}`}
                onClick={() => setMode(previewMode)}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </header>

      <div className="overflow-x-auto bg-surface-muted p-3 sm:p-5">
        <div className={`mx-auto min-h-72 overflow-hidden border border-border bg-background shadow-sm transition-[max-width] ${previewWidths[mode]}`}>
          {visibleBlocks.length > 0 ? (
            <ContentPageBlocks blocks={visibleBlocks} preview locale={locale} defaultLocale={defaultLocale} />
          ) : (
            <div className="flex min-h-72 items-center justify-center p-6 text-center text-sm text-muted">
              {t("admin.contentPages.preview.empty")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
