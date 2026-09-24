"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { T_BlockedSlot, T_ServiceLocation, T_ServiceProvider, T_WeeklySchedule, T_WorkingPeriod } from "@/entities/service";
import { useAdminAccess } from "@/features/auth";
import { getServicesState, saveServiceLocation, saveServiceProvider, ServicesApiError } from "@/shared/api/services";
import { useI18n } from "@/shared/i18n";
import { Button, Input, Switch } from "@/shared/ui";
import { AdminCard, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";

type T_ScheduleEntity = T_ServiceProvider | T_ServiceLocation;
const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

export const ScheduleEditor = ({ kind, id }: { kind: "provider" | "location"; id: string }) => {
  const router = useRouter(); const { t, locale } = useI18n(); const { canManage } = useAdminAccess();
  const [entity, setEntity] = useState<T_ScheduleEntity | null>(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(true);
  const [block, setBlock] = useState({ startAt: "", endAt: "", reason: "" });
  useEffect(() => { getServicesState().then((state) => setEntity(kind === "provider" ? state.providers.find((item) => item.id === id) ?? null : state.locations.find((item) => item.id === id) ?? null)).catch(() => setError(t("admin.services.error.load"))).finally(() => setBusy(false)); }, [id, kind, t]);
  const patchDay = (dayOfWeek: number, values: Partial<T_WeeklySchedule>) => entity && setEntity({ ...entity, schedule: entity.schedule.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, ...values } : day) });
  const patchPeriod = (day: T_WeeklySchedule, field: "periods" | "breaks", index: number, values: Partial<T_WorkingPeriod>) => patchDay(day.dayOfWeek, { [field]: day[field].map((period, currentIndex) => currentIndex === index ? { ...period, ...values } : period) });
  const addPeriod = (day: T_WeeklySchedule, field: "periods" | "breaks") => patchDay(day.dayOfWeek, { [field]: [...day[field], { start: field === "periods" ? "09:00" : "13:00", end: field === "periods" ? "18:00" : "14:00" }] });
  const removePeriod = (day: T_WeeklySchedule, field: "periods" | "breaks", index: number) => patchDay(day.dayOfWeek, { [field]: day[field].filter((_, currentIndex) => currentIndex !== index) });
  const addBlock = () => {
    if (!entity || !block.startAt || !block.endAt || !block.reason.trim()) return;
    const item: T_BlockedSlot = { id: createId(), startAt: new Date(block.startAt).toISOString(), endAt: new Date(block.endAt).toISOString(), reason: block.reason.trim() };
    if (new Date(item.endAt) <= new Date(item.startAt)) { setError(t("admin.services.schedule.invalidBlock")); return; }
    setEntity({ ...entity, blockedSlots: [...entity.blockedSlots, item] }); setBlock({ startAt: "", endAt: "", reason: "" }); setError("");
  };
  const save = async () => {
    if (!entity || !canManage) return; setError(""); setBusy(true);
    try { if (kind === "provider") await saveServiceProvider(entity as T_ServiceProvider); else await saveServiceLocation(entity as T_ServiceLocation); router.push("/admin/services"); }
    catch (caught) { setError(caught instanceof ServicesApiError ? caught.message : t("admin.services.error.save")); }
    finally { setBusy(false); }
  };
  if (busy && !entity) return <AdminPage title={t("common.dataState.loading")}><div /></AdminPage>;
  if (!entity) return <AdminPage title={t("admin.services.schedule.notFound")}><div /></AdminPage>;

  return <AdminPage title={t("admin.services.schedule.title", { name: entity.name })} description={t("admin.services.schedule.description")} actions={<><Button variant="secondary" className="h-10" onClick={() => router.push("/admin/services")}>{t("admin.actions.cancel")}</Button><Button className="h-10" disabled={!canManage || busy} onClick={() => void save()}>{busy ? t("admin.form.saving") : t("admin.actions.saveChanges")}</Button></>}>
    <div className="space-y-5"><AdminFormAlert message={error} />
      <div className="grid gap-4 xl:grid-cols-2">{entity.schedule.map((day) => {
        const dayName = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + day.dayOfWeek)));
        return <AdminCard key={day.dayOfWeek} title={dayName}><div className="space-y-4"><Switch label={t("admin.services.schedule.workingDay")} checked={day.enabled} disabled={!canManage} onChange={(event) => patchDay(day.dayOfWeek, { enabled: event.target.checked })} />
          {day.enabled && <><PeriodList title={t("admin.services.schedule.periods")} periods={day.periods} disabled={!canManage} onAdd={() => addPeriod(day, "periods")} onChange={(index, values) => patchPeriod(day, "periods", index, values)} onRemove={(index) => removePeriod(day, "periods", index)} /><PeriodList title={t("admin.services.schedule.breaks")} periods={day.breaks} disabled={!canManage} onAdd={() => addPeriod(day, "breaks")} onChange={(index, values) => patchPeriod(day, "breaks", index, values)} onRemove={(index) => removePeriod(day, "breaks", index)} /></>}
        </div></AdminCard>;
      })}</div>
      <AdminCard title={t("admin.services.schedule.blockedTitle")} description={t("admin.services.schedule.blockedDescription")}><div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"><Input type="datetime-local" label={t("admin.services.schedule.start")} value={block.startAt} onChange={(event) => setBlock({ ...block, startAt: event.target.value })} /><Input type="datetime-local" label={t("admin.services.schedule.end")} value={block.endAt} onChange={(event) => setBlock({ ...block, endAt: event.target.value })} /><Input label={t("admin.services.schedule.reason")} value={block.reason} onChange={(event) => setBlock({ ...block, reason: event.target.value })} /><Button variant="secondary" className="mt-6 flex h-10 items-center gap-2" disabled={!canManage} onClick={addBlock}><Plus className="h-4 w-4" />{t("admin.services.schedule.block")}</Button></div>
        <div className="mt-4 space-y-2">{entity.blockedSlots.map((item) => <div key={item.id} className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{item.reason}</p><p className="text-sm text-muted">{new Date(item.startAt).toLocaleString()} – {new Date(item.endAt).toLocaleString()}</p></div><Button variant="danger" className="h-10 w-10 p-0" aria-label={t("admin.services.schedule.removeBlock")} onClick={() => setEntity({ ...entity, blockedSlots: entity.blockedSlots.filter((blockItem) => blockItem.id !== item.id) })}><Trash2 className="mx-auto h-5 w-5" /></Button></div>)}</div>
      </AdminCard>
    </div>
  </AdminPage>;
};

const PeriodList = ({ title, periods, disabled, onAdd, onChange, onRemove }: { title: string; periods: T_WorkingPeriod[]; disabled: boolean; onAdd: () => void; onChange: (index: number, values: Partial<T_WorkingPeriod>) => void; onRemove: (index: number) => void }) => <div><div className="mb-2 flex items-center justify-between"><p className="text-sm font-medium">{title}</p><Button variant="ghost" className="h-8 w-8 p-0" disabled={disabled} aria-label={title} onClick={onAdd}><Plus className="h-4 w-4" /></Button></div><div className="space-y-2">{periods.map((period, index) => <div key={`${index}-${period.start}`} className="grid grid-cols-[1fr_1fr_2.5rem] gap-2"><Input aria-label={`${title} start ${index + 1}`} type="time" value={period.start} disabled={disabled} onChange={(event) => onChange(index, { start: event.target.value })} /><Input aria-label={`${title} end ${index + 1}`} type="time" value={period.end} disabled={disabled} onChange={(event) => onChange(index, { end: event.target.value })} /><Button variant="ghost" className="h-10 w-10 p-0" disabled={disabled} aria-label={`${title} remove ${index + 1}`} onClick={() => onRemove(index)}><Trash2 className="mx-auto h-4 w-4" /></Button></div>)}</div></div>;
