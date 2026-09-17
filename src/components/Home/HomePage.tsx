"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Film,
  GitCompareArrows,
  GitFork,
  Layers3,
  ShoppingBag,
} from "lucide-react";
import type { T_Product } from "@/entities/product/model/types";
import { getProducts } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";
import { ProductCard } from "@/components/Products/ProductCard";
import { useSiteSettings } from "@/shared/siteSettings";

const projectLinks = [
  { id: "store", href: "/products", icon: ShoppingBag, accent: "bg-emerald-400 text-zinc-950" },
  { id: "movies", href: "/movies", icon: Film, accent: "bg-rose-400 text-zinc-950" },
  { id: "popular", href: "/popular", icon: GitFork, accent: "bg-sky-400 text-zinc-950" },
  { id: "battle", href: "/battle", icon: GitCompareArrows, accent: "bg-amber-300 text-zinc-950" },
] as const;

export const HomePage = () => {
  const { t } = useI18n();
  const settings = useSiteSettings();
  const [products, setProducts] = useState<T_Product[]>([]);

  useEffect(() => {
    getProducts()
      .then((nextProducts) => {
        setProducts(
          nextProducts.filter((product) =>
            product.status === "active" &&
            (settings.commerce.showOutOfStockProducts || product.stockQuantity > 0),
          ).slice(0, 4),
        );
      })
      .catch(() => setProducts([]));
  }, [settings.commerce.showOutOfStockProducts]);

  return (
    <div className="space-y-16 pb-10 sm:space-y-24">
      <section className="relative left-1/2 -mt-6 w-screen -translate-x-1/2 overflow-hidden border-b border-border bg-zinc-950 text-white sm:-mt-8">
        <div className="mx-auto grid min-h-[min(720px,82vh)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.9fr)] lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-emerald-300">
              <Code2 className="h-5 w-5" aria-hidden="true" />
              <span>{t("home.portfolioEyebrow")}</span>
            </div>
            <h1 className="text-5xl font-bold sm:text-6xl lg:text-7xl">AIO</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300 sm:text-xl">
              {t("home.portfolioDescription")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#projects"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-zinc-950 transition hover:bg-emerald-300"
              >
                {t("home.exploreProjects")}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/products"
                className="inline-flex h-12 items-center rounded-md border border-zinc-600 px-5 font-semibold transition hover:border-zinc-300 hover:bg-zinc-900"
              >
                {t("home.openStore")}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3" aria-label={t("home.projectsLabel")}>
            {projectLinks.map(({ id, href, icon: Icon, accent }) => (
              <Link
                key={id}
                href={href}
                className="group flex min-h-40 flex-col justify-between rounded-md border border-zinc-700 bg-zinc-900 p-4 transition hover:border-zinc-400 sm:min-h-48 sm:p-5"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-md ${accent}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-base sm:text-lg">
                    {t(`home.project.${id}.title`)}
                  </strong>
                  <span className="mt-1 block text-xs leading-5 text-zinc-400 sm:text-sm">
                    {t(`home.project.${id}.short`)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent">{t("home.projectsEyebrow")}</p>
          <h2 id="projects-title" className="mt-2 text-3xl font-bold sm:text-4xl">
            {t("home.projectsTitle")}
          </h2>
          <p className="mt-4 leading-7 text-muted">{t("home.projectsDescription")}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {projectLinks.map(({ id, href, icon: Icon, accent }) => (
            <Link
              key={id}
              href={href}
              className="group flex min-h-64 flex-col justify-between overflow-hidden rounded-md border border-border bg-surface p-6 transition hover:border-accent sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-md ${accent}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <ArrowRight
                  className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-accent"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-12">
                <h3 className="text-2xl font-bold">{t(`home.project.${id}.title`)}</h3>
                <p className="mt-3 max-w-lg leading-7 text-muted">
                  {t(`home.project.${id}.description`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border py-10" aria-labelledby="platform-title">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Layers3 className="h-5 w-5" aria-hidden="true" />
              <p className="text-sm font-semibold">{t("home.platformEyebrow")}</p>
            </div>
            <h2 id="platform-title" className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("home.platformTitle")}
            </h2>
          </div>
          <p className="leading-7 text-muted sm:text-lg">{t("home.platformDescription")}</p>
        </div>
      </section>

      {!!products.length && (
        <section aria-labelledby="store-preview-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-accent">{t("home.storePreviewEyebrow")}</p>
              <h2 id="store-preview-title" className="mt-2 text-3xl font-bold sm:text-4xl">
                {t("home.storePreviewTitle")}
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-2 font-semibold text-accent hover:underline sm:flex"
            >
              {t("home.viewCatalog")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
