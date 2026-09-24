"use client";

import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { T_ServicesState } from "@/entities/service";
import { localizeService } from "@/entities/service";
import { createAppointment, getAvailableServiceSlots, getServicesState, ServicesApiError } from "@/shared/api/services";
import { useI18n } from "@/shared/i18n";
import { usePriceFormatter, useSiteSettings } from "@/shared/siteSettings";
import { Button, Checkbox, DataState, Input, Select, Textarea } from "@/shared/ui";

export const ServiceDetail = ({ slug }: { slug: string }) => {
  const { locale, t } = useI18n(); const settings = useSiteSettings(); const formatPrice = usePriceFormatter();
  const [state, setState] = useState<T_ServicesState | null>(null); const [slots, setSlots] = useState<string[]>([]);
  const [form, setForm] = useState({ providerId: "", locationId: "", date: "", startAt: "", customerName: "", customerEmail: "", customerPhone: "", customerNote: "", variantId: "", addOnIds: [] as string[] });
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { getServicesState().then(setState).catch(() => setError(t("services.error.description"))); }, [t]);
  const service = useMemo(() => { const item = state?.services.find((entry) => entry.slug === slug && entry.status === "active"); return item ? localizeService(item, locale, settings.localization.defaultLocale) : undefined; }, [locale, settings.localization.defaultLocale, slug, state]);
  const providers = state?.providers.filter((item) => item.status === "active" && service?.providerIds.includes(item.id)) ?? [];
  const locations = state?.locations.filter((item) => item.status === "active" && service?.locationIds.includes(item.id)) ?? [];
  useEffect(() => { if (!form.providerId || !form.locationId || !form.date || !service) return; getAvailableServiceSlots(service.id, form.providerId, form.locationId, form.date).then(setSlots); }, [form.date, form.locationId, form.providerId, service]);
  if (!state) return <DataState variant="loading" title={t("common.dataState.loading")} />;
  if (!service) return <div className="mx-auto max-w-3xl p-8"><DataState variant="empty" title={t("services.notFound")} /><Link className="mt-4 inline-block text-accent underline" href="/services">{t("services.back")}</Link></div>;
  const selectedVariant = service.variants.find((item) => item.id === form.variantId); const total = (selectedVariant?.price ?? service.price) + service.addOns.filter((item) => form.addOnIds.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(""); setSuccess(""); try { const appointment = await createAppointment({ serviceId: service.id, variantId: form.variantId || undefined, addOnIds: form.addOnIds, providerId: form.providerId, locationId: form.locationId, customerName: form.customerName, customerEmail: form.customerEmail, customerPhone: form.customerPhone, startAt: form.startAt, timezone: locations.find((item) => item.id === form.locationId)?.timezone ?? settings.localization.timezone, customerNote: form.customerNote }); setSuccess(t("services.booking.success", { id: appointment.id })); setForm({ ...form, startAt: "", customerNote: "" }); } catch (caught) { setError(caught instanceof ServicesApiError && caught.code === "CONFLICT" ? t("services.booking.conflict") : t("services.booking.error")); } finally { setBusy(false); } };
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Link className="text-sm text-muted hover:text-foreground" href="/services">← {t("services.back")}</Link><div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.65fr)]">
    <section><div className="flex aspect-[16/7] items-center justify-center rounded-md bg-surface-muted"><CalendarDays className="h-16 w-16 text-accent" /></div><h1 className="mt-6 text-3xl font-bold">{service.title}</h1><p className="mt-3 text-muted">{service.shortDescription}</p><div className="mt-5 flex flex-wrap gap-4"><span className="inline-flex items-center gap-2"><Clock className="h-5 w-5 text-accent" />{service.durationMinutes} {t("services.minutes")}</span><strong>{service.priceType === "from" && `${t("services.from")} `}{formatPrice(service.price, service.currency)}</strong></div><div className="mt-8 whitespace-pre-line leading-7">{service.description}</div></section>
    <aside className="self-start rounded-md border border-border bg-surface p-5"><h2 className="text-xl font-semibold">{t("services.booking.title")}</h2><form className="mt-5 grid gap-4" onSubmit={(event) => void submit(event)}>
      {error && <p role="alert" className="rounded-md bg-danger-soft p-3 text-sm text-danger">{error}</p>}{success && <p role="status" className="rounded-md border border-accent bg-accent/10 p-3 text-sm">{success}</p>}
      {service.variants.length > 0 && <Select label={t("services.booking.variant")} value={form.variantId} onChange={(event) => setForm({ ...form, variantId: event.target.value })} options={[{ value: "", label: t("services.booking.defaultVariant") }, ...service.variants.map((item) => ({ value: item.id, label: item.title }))]} />}
      {service.addOns.map((item) => <Checkbox key={item.id} label={`${item.title} (+${formatPrice(item.price, service.currency)})`} checked={form.addOnIds.includes(item.id)} onChange={(event) => setForm({ ...form, addOnIds: event.target.checked ? [...form.addOnIds, item.id] : form.addOnIds.filter((id) => id !== item.id) })} />)}
      <Select required label={t("services.booking.location")} value={form.locationId} onChange={(event) => { setSlots([]); setForm({ ...form, locationId: event.target.value, startAt: "" }); }} options={[{ value: "", label: t("services.booking.chooseLocation") }, ...locations.map((item) => ({ value: item.id, label: `${item.name} · ${item.address}` }))]} />
      <Select required label={t("services.booking.provider")} value={form.providerId} onChange={(event) => { setSlots([]); setForm({ ...form, providerId: event.target.value, startAt: "" }); }} options={[{ value: "", label: t("services.booking.chooseProvider") }, ...providers.filter((item) => !form.locationId || item.locationIds.includes(form.locationId)).map((item) => ({ value: item.id, label: item.name }))]} />
      <Input required type="date" min={new Date().toISOString().slice(0, 10)} label={t("services.booking.date")} value={form.date} onChange={(event) => { setSlots([]); setForm({ ...form, date: event.target.value, startAt: "" }); }} />
      <Select required label={t("services.booking.time")} value={form.startAt} onChange={(event) => setForm({ ...form, startAt: event.target.value })} options={[{ value: "", label: slots.length ? t("services.booking.chooseTime") : t("services.booking.noSlots") }, ...slots.map((slot) => ({ value: slot, label: new Date(slot).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }))]} />
      <Input required label={t("services.booking.name")} value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} /><Input required type="email" label={t("services.booking.email")} value={form.customerEmail} onChange={(event) => setForm({ ...form, customerEmail: event.target.value })} /><Input type="tel" label={t("services.booking.phone")} value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} /><Textarea label={t("services.booking.note")} value={form.customerNote} onChange={(event) => setForm({ ...form, customerNote: event.target.value })} />
      <div className="flex items-center justify-between border-t border-border pt-4"><strong>{formatPrice(total, service.currency)}</strong><Button type="submit" className="h-10" disabled={busy || !form.startAt}>{busy ? t("services.booking.saving") : t("services.booking.submit")}</Button></div>
    </form></aside>
  </div></main>;
};
