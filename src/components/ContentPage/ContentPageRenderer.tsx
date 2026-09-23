"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLocalizedText, type T_ContentPage } from "@/entities/contentPage";
import { getContentPageBySlug } from "@/shared/api/contentPages";
import { useI18n } from "@/shared/i18n";
import { ContentPageBlocks } from "./ContentPageBlocks";
import { AssignedMenuLayout } from "@/components/Menu";
import { ContentPagesApiError } from "@/shared/api/contentPages";
import { DataState } from "@/shared/ui";

export const ContentPageRenderer = ({ slug }: { slug: string }) => {
  const { t, locale } = useI18n();
  const [page, setPage] = useState<T_ContentPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const contentPage = await getContentPageBySlug(slug);
        setPage(contentPage.status === "published" ? contentPage : null);
      } catch (error) {
        setPage(null);
        setHasError(!(error instanceof ContentPagesApiError && error.code === "NOT_FOUND"));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPage();
  }, [reloadKey, slug]);

  useEffect(() => {
    if (page) {
      document.title = getLocalizedText(page.seo.title, locale, page.defaultLocale) || getLocalizedText(page.title, locale, page.defaultLocale);
    }
  }, [locale, page]);

  if (isLoading) {
    return <main className="mx-auto w-full max-w-7xl px-4 py-12"><DataState variant="loading" title={t("contentPage.loading")} /></main>;
  }

  if (hasError) {
    return <main className="mx-auto w-full max-w-7xl px-4 py-12"><DataState variant="error" description={t("contentPage.loadError")} onAction={() => setReloadKey((value) => value + 1)} /></main>;
  }

  if (!page) {
    return (
      <main className="mx-auto flex min-h-80 w-full max-w-7xl flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-foreground">{t("contentPage.notFound")}</h1>
        <p className="mt-2 text-sm text-muted">{t("contentPage.notFoundDescription")}</p>
        <Link href="/" className="mt-5 inline-flex min-h-10 items-center rounded-md bg-accent px-4 font-medium text-background">
          {t("contentPage.backHome")}
        </Link>
      </main>
    );
  }

  const pageTitle = getLocalizedText(page.title, locale, page.defaultLocale);
  const visibleBlocks = page.blocks.filter(
    (block) => block.isVisible,
  );

  return (
    <main><AssignedMenuLayout target={{ type: "contentPage", entityId: page.id }}>
      {visibleBlocks.length === 0 ? (
        <section className="mx-auto min-h-80 max-w-7xl px-4 py-12 text-center">
          <h1 className="text-3xl font-semibold text-foreground">{pageTitle}</h1>
          <p className="mt-3 text-muted">{t("contentPage.empty")}</p>
        </section>
      ) : <ContentPageBlocks blocks={visibleBlocks} locale={locale} defaultLocale={page.defaultLocale} />}
    </AssignedMenuLayout></main>
  );
};
