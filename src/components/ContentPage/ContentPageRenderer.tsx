"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLocalizedText, type T_ContentPage } from "@/entities/contentPage";
import { getContentPageBySlug } from "@/shared/api/contentPages";
import { useI18n } from "@/shared/i18n";
import { ContentPageBlocks } from "./ContentPageBlocks";

export const ContentPageRenderer = ({ slug }: { slug: string }) => {
  const { t, locale } = useI18n();
  const [page, setPage] = useState<T_ContentPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const contentPage = await getContentPageBySlug(slug);
        setPage(contentPage.status === "published" ? contentPage : null);
      } catch {
        setPage(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPage();
  }, [slug]);

  useEffect(() => {
    if (page) {
      document.title = getLocalizedText(page.seo.title, locale, page.defaultLocale) || getLocalizedText(page.title, locale, page.defaultLocale);
    }
  }, [locale, page]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-80 w-full max-w-7xl items-center justify-center px-4 py-12 text-sm text-muted">
        {t("contentPage.loading")}
      </main>
    );
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
    <main>
      {visibleBlocks.length === 0 ? (
        <section className="mx-auto min-h-80 max-w-7xl px-4 py-12 text-center">
          <h1 className="text-3xl font-semibold text-foreground">{pageTitle}</h1>
          <p className="mt-3 text-muted">{t("contentPage.empty")}</p>
        </section>
      ) : <ContentPageBlocks blocks={visibleBlocks} locale={locale} defaultLocale={page.defaultLocale} />}
    </main>
  );
};
