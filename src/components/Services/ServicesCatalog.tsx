"use client";

import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { T_ServicesState } from "@/entities/service";
import { localizeService } from "@/entities/service";
import { getServicesState } from "@/shared/api/services";
import { useI18n } from "@/shared/i18n";
import { usePriceFormatter, useSiteSettings } from "@/shared/siteSettings";
import { DataState } from "@/shared/ui";

export const ServicesCatalog = () => {
  const { locale, t } = useI18n();
  const settings = useSiteSettings();
  const formatPrice = usePriceFormatter();
  const [state, setState] = useState<T_ServicesState | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { getServicesState().then(setState).catch(() => setError(true)); }, []);
  const services = useMemo(() => state?.services.filter((item) => item.status === "active").map((item) => localizeService(item, locale, settings.localization.defaultLocale)) ?? [], [locale, settings.localization.defaultLocale, state]);
  if (error) return <DataState variant="error" title={t("services.error.title")} description={t("services.error.description")} />;
  if (!state) return <DataState variant="loading" title={t("common.dataState.loading")} />;
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <header className="mb-8 border-b border-border pb-6"><p className="text-sm font-semibold uppercase text-accent">{t("services.eyebrow")}</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t("services.title")}</h1><p className="mt-3 max-w-2xl text-muted">{t("services.description")}</p></header>
    {services.length === 0 ? <DataState variant="empty" title={t("services.empty.title")} description={t("services.empty.description")} /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{services.map((service) => <article key={service.id} className="flex min-h-72 flex-col overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex aspect-[16/7] items-center justify-center bg-surface-muted"><CalendarDays className="h-12 w-12 text-accent" aria-hidden="true" /></div>
      <div className="flex flex-1 flex-col p-5"><h2 className="text-xl font-semibold">{service.title}</h2><p className="mt-2 line-clamp-3 text-sm text-muted">{service.shortDescription}</p><div className="mt-4 flex flex-wrap gap-4 text-sm"><span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{service.durationMinutes} {t("services.minutes")}</span><span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{service.locationIds.length}</span></div><div className="mt-auto flex items-end justify-between gap-3 pt-5"><p className="font-semibold">{service.priceType === "from" && `${t("services.from")} `}{formatPrice(service.price, service.currency)}</p><Link className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background transition hover:opacity-85" href={`/services/${service.slug}`}>{t("services.view")}</Link></div></div>
    </article>)}</div>}
  </main>;
};
