"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { T_Appointment, T_AppointmentStatus, T_ServicesState } from "@/entities/service";
import { useAdminAccess } from "@/features/auth";
import { getAvailableServiceSlots, getServicesState, ServicesApiError, updateAppointment } from "@/shared/api/services";
import { WarehouseApiError } from "@/shared/api/warehouse";
import { useI18n } from "@/shared/i18n";
import { usePriceFormatter } from "@/shared/siteSettings";
import { Button, Input, Select, Textarea } from "@/shared/ui";
import { AdminCard, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";

const emptyState: T_ServicesState = { categories: [], services: [], providers: [], locations: [], appointments: [] };
const statusValues: T_AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled", "no_show"];
const statusKeys: Record<T_AppointmentStatus, "admin.services.status.pending" | "admin.services.status.confirmed" | "admin.services.status.completed" | "admin.services.status.cancelled" | "admin.services.status.no_show"> = { pending: "admin.services.status.pending", confirmed: "admin.services.status.confirmed", completed: "admin.services.status.completed", cancelled: "admin.services.status.cancelled", no_show: "admin.services.status.no_show" };

export const AppointmentDetail = ({ appointmentId }: { appointmentId: string }) => {
  const router = useRouter(); const { t } = useI18n(); const { canManage, session } = useAdminAccess(); const formatPrice = usePriceFormatter();
  const [state, setState] = useState<T_ServicesState>(emptyState); const [appointment, setAppointment] = useState<T_Appointment | null>(null);
  const [form, setForm] = useState({ status: "pending" as T_AppointmentStatus, providerId: "", locationId: "", date: "", startAt: "", adminNote: "", cancellationReason: "" });
  const [slots, setSlots] = useState<string[]>([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(true);
  useEffect(() => { getServicesState().then((next) => { setState(next); const item = next.appointments.find((entry) => entry.id === appointmentId) ?? null; setAppointment(item); if (item) setForm({ status: item.status, providerId: item.providerId, locationId: item.locationId, date: item.startAt.slice(0, 10), startAt: item.startAt, adminNote: item.adminNote, cancellationReason: item.cancellationReason ?? "" }); }).catch(() => setError(t("admin.services.error.load"))).finally(() => setBusy(false)); }, [appointmentId, t]);
  const service = state.services.find((item) => item.id === appointment?.serviceId);
  const providers = state.providers.filter((item) => item.status === "active" && service?.providerIds.includes(item.id) && (!form.locationId || item.locationIds.includes(form.locationId)));
  const locations = state.locations.filter((item) => item.status === "active" && service?.locationIds.includes(item.id));
  useEffect(() => { if (!service || !form.providerId || !form.locationId || !form.date) return; getAvailableServiceSlots(service.id, form.providerId, form.locationId, form.date, appointmentId).then(setSlots); }, [appointmentId, form.date, form.locationId, form.providerId, service]);
  const variant = service?.variants.find((item) => item.id === appointment?.variantId);
  const addOns = service?.addOns.filter((item) => appointment?.addOnIds.includes(item.id)) ?? [];
  const save = async () => {
    if (!appointment || !canManage) return; if (form.status === "cancelled" && !form.cancellationReason.trim()) { setError(t("admin.services.appointment.cancelReasonRequired")); return; }
    setBusy(true); setError("");
    try {
      const updated = await updateAppointment({ id: appointment.id, status: form.status, adminNote: form.adminNote, cancellationReason: form.status === "cancelled" ? form.cancellationReason : undefined, updatedBy: session?.displayName ?? "Staff",
        ...(form.startAt !== appointment.startAt ? { startAt: form.startAt } : {}), ...(form.providerId !== appointment.providerId ? { providerId: form.providerId } : {}), ...(form.locationId !== appointment.locationId ? { locationId: form.locationId } : {}),
      });
      setAppointment(updated); setForm((current) => ({ ...current, cancellationReason: updated.cancellationReason ?? "" }));
    } catch (caught) { setError(caught instanceof ServicesApiError && caught.code === "CONFLICT" ? t("admin.services.appointment.conflict") : caught instanceof WarehouseApiError && caught.code === "INSUFFICIENT_STOCK" ? t("admin.services.appointment.insufficientMaterials") : caught instanceof Error ? caught.message : t("admin.services.error.save")); }
    finally { setBusy(false); }
  };
  if (busy && !appointment) return <AdminPage title={t("common.dataState.loading")}><div /></AdminPage>;
  if (!appointment || !service) return <AdminPage title={t("admin.services.appointment.notFound")}><div /></AdminPage>;

  return <AdminPage title={`${service.title} · ${appointment.customerName}`} description={appointment.id} actions={<><Button variant="secondary" className="h-10" onClick={() => router.push("/admin/services")}>{t("admin.actions.cancel")}</Button><Button className="h-10" disabled={!canManage || busy || !form.startAt} onClick={() => void save()}>{busy ? t("admin.form.saving") : t("admin.actions.saveChanges")}</Button></>}>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)]"><div className="space-y-5"><AdminFormAlert message={error} />
      <AdminCard title={t("admin.services.appointment.customerTitle")}><dl className="grid gap-4 sm:grid-cols-2"><Detail label={t("admin.services.fields.customer")} value={appointment.customerName} /><Detail label={t("admin.services.fields.email")} value={appointment.customerEmail} /><Detail label={t("admin.services.fields.phone")} value={appointment.customerPhone || "-"} /><Detail label={t("services.booking.note")} value={appointment.customerNote || "-"} /></dl></AdminCard>
      <AdminCard title={t("admin.services.appointment.serviceTitle")}><dl className="grid gap-4 sm:grid-cols-2"><Detail label={t("admin.services.fields.service")} value={service.title} /><Detail label={t("services.booking.variant")} value={variant?.title ?? t("services.booking.defaultVariant")} /><Detail label={t("admin.services.editor.addOns")} value={addOns.map((item) => item.title).join(", ") || "-"} /><Detail label={t("admin.services.fields.price")} value={formatPrice(appointment.totalPrice, appointment.currency)} />{appointment.materialsConsumedAt && <Detail label={t("admin.services.appointment.materialsConsumed")} value={new Date(appointment.materialsConsumedAt).toLocaleString()} />}</dl></AdminCard>
      <AdminCard title={t("admin.services.appointment.historyTitle")}><ol className="space-y-3">{appointment.statusHistory.map((entry, index) => <li key={`${entry.createdAt}-${index}`} className="border-l-2 border-border pl-4"><p className="font-medium">{t(statusKeys[entry.status])}</p><p className="text-sm text-muted">{new Date(entry.createdAt).toLocaleString()} · {entry.createdBy}</p>{entry.note && <p className="mt-1 text-sm">{entry.note}</p>}</li>)}</ol></AdminCard>
    </div><aside className="space-y-5"><AdminCard title={t("admin.services.appointment.manageTitle")}><div className="grid gap-4"><Select label={t("admin.services.fields.status")} value={form.status} disabled={!canManage} onChange={(event) => setForm({ ...form, status: event.target.value as T_AppointmentStatus })} options={statusValues.map((value) => ({ value, label: t(statusKeys[value]) }))} />
      <Select label={t("services.booking.location")} value={form.locationId} disabled={!canManage} onChange={(event) => { setSlots([]); setForm({ ...form, locationId: event.target.value, startAt: "" }); }} options={locations.map((item) => ({ value: item.id, label: item.name }))} /><Select label={t("services.booking.provider")} value={form.providerId} disabled={!canManage} onChange={(event) => { setSlots([]); setForm({ ...form, providerId: event.target.value, startAt: "" }); }} options={providers.map((item) => ({ value: item.id, label: item.name }))} /><Input type="date" label={t("services.booking.date")} value={form.date} disabled={!canManage} onChange={(event) => { setSlots([]); setForm({ ...form, date: event.target.value, startAt: "" }); }} /><Select label={t("services.booking.time")} value={form.startAt} disabled={!canManage} onChange={(event) => setForm({ ...form, startAt: event.target.value })} options={[...(form.startAt && !slots.includes(form.startAt) ? [{ value: form.startAt, label: new Date(form.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }] : []), ...slots.map((slot) => ({ value: slot, label: new Date(slot).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }))]} />
      <Textarea label={t("admin.services.appointment.adminNote")} value={form.adminNote} disabled={!canManage} onChange={(event) => setForm({ ...form, adminNote: event.target.value })} />{form.status === "cancelled" && <Textarea required label={t("admin.services.appointment.cancelReason")} value={form.cancellationReason} disabled={!canManage} onChange={(event) => setForm({ ...form, cancellationReason: event.target.value })} />}
    </div></AdminCard></aside></div>
  </AdminPage>;
};

const Detail = ({ label, value }: { label: string; value: string }) => <div><dt className="text-xs uppercase text-muted">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
