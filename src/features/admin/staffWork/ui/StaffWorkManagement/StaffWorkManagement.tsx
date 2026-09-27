"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { T_CustomRole } from "@/entities/customRole";
import type { T_Employee, T_SaveEmployeeDto } from "@/entities/employee";
import type { T_CreateStaffWorkDto, T_StaffWorkRecord, T_StaffWorkSplitMode, T_StaffWorkStatus } from "@/entities/staffWork";
import type { T_ServicesState, T_WeeklySchedule } from "@/entities/service";
import { useAdminAccess } from "@/features/auth";
import { getCustomRoles } from "@/shared/api/customRoles";
import { getServicesState } from "@/shared/api/services";
import { changeStaffWorkStatus, createStaffWork, getStaffWorkState, saveEmployee, StaffWorkApiError, updateStaffWork } from "@/shared/api/staffWork";
import { assignableStaffRoles, type T_StaffRole } from "@/shared/config/adminRoles";
import { useI18n } from "@/shared/i18n";
import { Button, Checkbox, Input, Select, Textarea } from "@/shared/ui";
import { AdminCard, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";

type T_Tab = "employees" | "workspace" | "work" | "reports";
type T_Translate = ReturnType<typeof useI18n>["t"];
const emptyServices: T_ServicesState = { categories: [], services: [], providers: [], locations: [], appointments: [] };
const defaultSchedule = (): T_WeeklySchedule[] => Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: dayOfWeek > 0 && dayOfWeek < 6, periods: [{ start: "09:00", end: "18:00" }], breaks: [] }));
const emptyEmployee = (): T_SaveEmployeeDto => ({ firstName: "", lastName: "", email: "", phone: "", status: "active", roleIds: ["viewer"], branchIds: [], serviceCategoryIds: [], skills: [], schedule: defaultSchedule(), notes: "" });
const initialWork = (): T_CreateStaffWorkDto => ({ serviceId: "", performedAt: new Date().toISOString().slice(0, 16), quantity: 1, discount: 0, notes: "", splitMode: "equal", performers: [], materials: [], createdBy: "" });
const csv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const nextStatuses = (status: T_StaffWorkStatus): T_StaffWorkStatus[] => status === "planned" ? ["in_progress", "void"] : status === "in_progress" ? ["completed", "void"] : status === "completed" ? ["approved", "in_progress", "void"] : [];
const dayKeys = ["admin.staff.day.0", "admin.staff.day.1", "admin.staff.day.2", "admin.staff.day.3", "admin.staff.day.4", "admin.staff.day.5", "admin.staff.day.6"] as const;
const actionKeys = { in_progress: "admin.staff.action.in_progress", completed: "admin.staff.action.completed", approved: "admin.staff.action.approved", void: "admin.staff.action.void" } as const;

export const StaffWorkManagement = () => {
  const { t, locale } = useI18n();
  const { session, can } = useAdminAccess();
  const [tab, setTab] = useState<T_Tab>("employees");
  const [employees, setEmployees] = useState<T_Employee[]>([]);
  const [records, setRecords] = useState<T_StaffWorkRecord[]>([]);
  const [services, setServices] = useState<T_ServicesState>(emptyServices);
  const [customRoles, setCustomRoles] = useState<T_CustomRole[]>([]);
  const [employee, setEmployee] = useState<T_SaveEmployeeDto>(emptyEmployee);
  const [work, setWork] = useState<T_CreateStaffWorkDto>(initialWork);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [state, serviceState, roles] = await Promise.all([getStaffWorkState(), getServicesState(), getCustomRoles()]);
    setEmployees(state.employees);
    setRecords(state.workRecords);
    setServices(serviceState);
    setCustomRoles(roles);
  }, []);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const actor = session?.displayName ?? "Staff";
  const currentEmployee = employees.find((item) => item.email.toLowerCase() === session?.email.toLowerCase());
  const workspace = currentEmployee ? records.filter((item) => item.performers.some((performer) => performer.employeeId === currentEmployee.id) && item.status !== "void") : [];
  const appointments = currentEmployee?.providerId ? services.appointments.filter((item) => item.providerId === currentEmployee.providerId && !["cancelled", "no_show"].includes(item.status)) : [];
  const reports = useMemo(() => employees.map((item) => {
    const own = records.filter((record) => record.performers.some((performer) => performer.employeeId === item.id));
    const approved = own.filter((record) => record.status === "approved");
    const revenueByCurrency = approved.reduce<Record<string, number>>((totals, record) => { const amount = record.performers.find((performer) => performer.employeeId === item.id)?.amount ?? 0; totals[record.currency] = (totals[record.currency] ?? 0) + amount; return totals; }, {});
    return { employee: item, completed: own.filter((record) => ["completed", "approved"].includes(record.status)).length, approved: approved.length, revenueByCurrency };
  }), [employees, records]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setError(""); setMessage("");
    try { await action(); await load(); setMessage(success); return true; }
    catch (caught) { setError(caught instanceof StaffWorkApiError ? caught.message : t("admin.staff.error")); return false; }
  };
  const toggleRole = (role: T_StaffRole, checked: boolean) => setEmployee((current) => ({ ...current, roleIds: checked ? [...current.roleIds, role] : current.roleIds.filter((item) => item !== role) }));
  const togglePerformer = (employeeId: string, checked: boolean) => setWork((current) => {
    if (checked) return { ...current, performers: [...current.performers, { employeeId, isPrimary: current.performers.length === 0 }] };
    const removedWasPrimary = current.performers.find((item) => item.employeeId === employeeId)?.isPrimary;
    const performers = current.performers.filter((item) => item.employeeId !== employeeId).map((item, index) => ({ ...item, isPrimary: removedWasPrimary ? index === 0 : item.isPrimary }));
    return { ...current, performers };
  });
  const setPrimaryPerformer = (employeeId: string) => setWork((current) => ({ ...current, performers: current.performers.map((item) => ({ ...item, isPrimary: item.employeeId === employeeId })) }));
  const setShare = (employeeId: string, field: "percentage" | "amount", value: number) => setWork((current) => ({ ...current, performers: current.performers.map((item) => item.employeeId === employeeId ? { ...item, [field]: value } : item) }));
  const saveEmployeeProfile = async () => { if (await run(() => saveEmployee(employee), t("admin.staff.success.employee"))) setEmployee(emptyEmployee()); };
  const saveWork = async () => { if (await run(() => createStaffWork({ ...work, performedAt: new Date(work.performedAt).toISOString(), createdBy: actor }), t("admin.staff.success.work"))) setWork(initialWork()); };
  const changeStatus = (record: T_StaffWorkRecord, status: T_StaffWorkStatus) => void run(() => changeStaffWorkStatus({ id: record.id, status, updatedBy: actor, note: t(`admin.staff.workStatus.${status}`) }), t("admin.staff.success.status"));
  const correctWork = (record: T_StaffWorkRecord, values: { quantity: number; unitPrice: number; discount: number; notes: string; reason: string }) => run(() => updateStaffWork({ id: record.id, ...values, updatedBy: actor }), t("admin.staff.success.correction"));
  const roleOptions = [
    ...assignableStaffRoles.map((id) => ({ id, label: t(`admin.auth.role.${id}`) })),
    ...customRoles.filter((role) => role.status === "active" || employee.roleIds.includes(role.id)).map((role) => ({ id: role.id, label: role.translations[locale].name || role.translations.uk.name || role.key })),
  ];

  return <AdminPage title={t("admin.staff.title")} description={t("admin.staff.description")}><div className="space-y-5">
    <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist">{(["employees", "workspace", "work", "reports"] as T_Tab[]).map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-medium ${tab === item ? "border-accent text-accent" : "border-transparent text-muted"}`} onClick={() => setTab(item)}>{t(`admin.staff.tabs.${item}`)}</button>)}</div>
    <AdminFormAlert message={error} />{message && <p role="status" className="border border-accent bg-accent/10 p-3 text-sm">{message}</p>}
    {tab === "employees" && <EmployeeDirectory employees={employees} employee={employee} setEmployee={setEmployee} canManage={can("manage")} roleOptions={roleOptions} toggleRole={toggleRole} saveEmployeeProfile={saveEmployeeProfile} t={t} />}
    {tab === "work" && <div className="grid gap-5 xl:grid-cols-[25rem_minmax(0,1fr)]">{can("create") && <WorkForm employees={employees} services={services} work={work} setWork={setWork} togglePerformer={togglePerformer} setPrimaryPerformer={setPrimaryPerformer} setShare={setShare} saveWork={saveWork} t={t} />}<WorkList records={records} canApprove={can("approve")} canEdit={can("edit")} onStatus={changeStatus} onCorrect={correctWork} t={t} /></div>}
    {tab === "workspace" && <div className="space-y-5">{currentEmployee && <AppointmentList appointments={appointments} services={services} t={t} />}<WorkList records={workspace} canApprove={can("approve")} canEdit={can("edit")} onStatus={changeStatus} onCorrect={correctWork} t={t} empty={currentEmployee ? t("admin.staff.emptyWorkspace") : t("admin.staff.noProfile")} /></div>}
    {tab === "reports" && <Reports employees={reports} t={t} />}
  </div></AdminPage>;
};

const EmployeeDirectory = ({ employees, employee, setEmployee, canManage, roleOptions, toggleRole, saveEmployeeProfile, t }: {
  employees: T_Employee[]; employee: T_SaveEmployeeDto; setEmployee: React.Dispatch<React.SetStateAction<T_SaveEmployeeDto>>; canManage: boolean; roleOptions: Array<{ id: T_StaffRole; label: string }>;
  toggleRole: (role: T_StaffRole, checked: boolean) => void; saveEmployeeProfile: () => Promise<void>; t: T_Translate;
}) => {
  const updateSchedule = (dayIndex: number, patch: Partial<T_WeeklySchedule>) => setEmployee((current) => ({ ...current, schedule: current.schedule.map((day, index) => index === dayIndex ? { ...day, ...patch } : day) }));
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
    <AdminCard title={t("admin.staff.directory")}><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-border"><th className="p-3">{t("admin.staff.employee")}</th><th className="p-3">{t("admin.staff.status")}</th><th className="p-3">{t("admin.staff.branches")}</th><th className="p-3">{t("admin.staff.skills")}</th></tr></thead><tbody>{employees.map((item) => <tr key={item.id} className="border-b border-border"><td className="p-3"><button className="text-left font-semibold hover:text-accent" onClick={() => setEmployee(structuredClone(item))}>{item.firstName} {item.lastName}</button><span className="block text-xs text-muted">{item.email} / {item.phone || "-"}</span></td><td className="p-3">{t(`admin.staff.employeeStatus.${item.status}`)}</td><td className="p-3">{item.branchIds.join(", ") || "-"}</td><td className="p-3">{item.skills.join(", ") || "-"}</td></tr>)}</tbody></table>{!employees.length && <p className="p-4 text-sm text-muted">{t("admin.staff.emptyEmployees")}</p>}</div></AdminCard>
    {canManage && <AdminCard title={employee.id ? t("admin.staff.editEmployee") : t("admin.staff.addEmployee")}><form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); void saveEmployeeProfile(); }}>
      <div className="grid gap-3 sm:grid-cols-2"><Input required label={t("admin.staff.firstName")} value={employee.firstName} onChange={(event) => setEmployee({ ...employee, firstName: event.target.value })} /><Input required label={t("admin.staff.lastName")} value={employee.lastName} onChange={(event) => setEmployee({ ...employee, lastName: event.target.value })} /></div>
      <Input required type="email" label={t("admin.staff.email")} value={employee.email} onChange={(event) => setEmployee({ ...employee, email: event.target.value })} /><Input label={t("admin.staff.phone")} value={employee.phone} onChange={(event) => setEmployee({ ...employee, phone: event.target.value })} />
      <div className="grid gap-3 sm:grid-cols-2"><Input type="number" min="1" label={t("admin.staff.userId")} value={employee.userId ?? ""} onChange={(event) => setEmployee({ ...employee, userId: event.target.value ? Number(event.target.value) : undefined })} /><Input label={t("admin.staff.providerId")} value={employee.providerId ?? ""} onChange={(event) => setEmployee({ ...employee, providerId: event.target.value || undefined })} /></div>
      <Select label={t("admin.staff.status")} value={employee.status} onChange={(event) => setEmployee({ ...employee, status: event.target.value as T_Employee["status"] })} options={(["active", "inactive", "on_leave", "terminated"] as const).map((value) => ({ value, label: t(`admin.staff.employeeStatus.${value}`) }))} />
      <fieldset><legend className="mb-2 text-sm font-medium">{t("admin.staff.roles")}</legend><div className="grid gap-2 sm:grid-cols-2">{roleOptions.map((role) => <Checkbox key={role.id} label={role.label} checked={employee.roleIds.includes(role.id)} onChange={(event) => toggleRole(role.id, event.target.checked)} />)}</div></fieldset>
      <Input label={t("admin.staff.branches")} value={employee.branchIds.join(", ")} onChange={(event) => setEmployee({ ...employee, branchIds: csv(event.target.value) })} /><Input label={t("admin.staff.skills")} value={employee.skills.join(", ")} onChange={(event) => setEmployee({ ...employee, skills: csv(event.target.value) })} /><Input label={t("admin.staff.categories")} value={employee.serviceCategoryIds.join(", ")} onChange={(event) => setEmployee({ ...employee, serviceCategoryIds: csv(event.target.value) })} />
      <details className="border border-border p-3"><summary className="cursor-pointer font-medium">{t("admin.staff.schedule")}</summary><div className="mt-3 space-y-2">{employee.schedule.map((day, index) => { const dayLabel = t(dayKeys[day.dayOfWeek] ?? dayKeys[0]); return <div key={day.dayOfWeek} className="grid items-end gap-2 sm:grid-cols-[1fr_6.5rem_6.5rem]"><Checkbox label={dayLabel} checked={day.enabled} onChange={(event) => updateSchedule(index, { enabled: event.target.checked })} /><Input type="time" aria-label={`${dayLabel} ${t("admin.staff.start")}`} disabled={!day.enabled} value={day.periods[0]?.start ?? "09:00"} onChange={(event) => updateSchedule(index, { periods: [{ start: event.target.value, end: day.periods[0]?.end ?? "18:00" }] })} /><Input type="time" aria-label={`${dayLabel} ${t("admin.staff.end")}`} disabled={!day.enabled} value={day.periods[0]?.end ?? "18:00"} onChange={(event) => updateSchedule(index, { periods: [{ start: day.periods[0]?.start ?? "09:00", end: event.target.value }] })} /></div>; })}</div></details>
      <Textarea label={t("admin.staff.notes")} value={employee.notes} onChange={(event) => setEmployee({ ...employee, notes: event.target.value })} /><div className="flex flex-wrap gap-2"><Button type="submit">{t("admin.staff.saveEmployee")}</Button>{employee.id && <Button type="button" variant="secondary" onClick={() => setEmployee(emptyEmployee())}>{t("admin.actions.cancel")}</Button>}</div>
    </form></AdminCard>}
  </div>;
};

const WorkForm = ({ employees, services, work, setWork, togglePerformer, setPrimaryPerformer, setShare, saveWork, t }: {
  employees: T_Employee[]; services: T_ServicesState; work: T_CreateStaffWorkDto; setWork: React.Dispatch<React.SetStateAction<T_CreateStaffWorkDto>>; togglePerformer: (id: string, checked: boolean) => void;
  setPrimaryPerformer: (id: string) => void; setShare: (id: string, field: "percentage" | "amount", value: number) => void; saveWork: () => Promise<void>; t: T_Translate;
}) => <AdminCard title={t("admin.staff.recordWork")}><form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); void saveWork(); }}>
  <Select required label={t("admin.staff.service")} value={work.serviceId} onChange={(event) => { const service = services.services.find((item) => item.id === event.target.value); setWork({ ...work, serviceId: event.target.value, unitPrice: service?.price, durationMinutes: service?.durationMinutes, materials: structuredClone(service?.materials ?? []) }); }} options={[{ value: "", label: t("admin.staff.selectService") }, ...services.services.filter((item) => item.status === "active").map((item) => ({ value: item.id, label: item.title }))]} />
  <Input required type="datetime-local" label={t("admin.staff.performedAt")} value={work.performedAt} onChange={(event) => setWork({ ...work, performedAt: event.target.value })} />
  <div className="grid grid-cols-2 gap-3"><Input required type="number" min="1" label={t("admin.staff.quantity")} value={work.quantity} onChange={(event) => setWork({ ...work, quantity: Number(event.target.value) })} /><Input required type="number" min="0" label={t("admin.staff.duration")} value={work.durationMinutes ?? ""} onChange={(event) => setWork({ ...work, durationMinutes: Number(event.target.value) })} /><Input required type="number" min="0" step="0.01" label={t("admin.staff.price")} value={work.unitPrice ?? ""} onChange={(event) => setWork({ ...work, unitPrice: Number(event.target.value) })} /><Input required type="number" min="0" max="100" label={t("admin.staff.discount")} value={work.discount} onChange={(event) => setWork({ ...work, discount: Number(event.target.value) })} /></div>
  <Select label={t("admin.staff.splitMode")} value={work.splitMode} onChange={(event) => setWork({ ...work, splitMode: event.target.value as T_StaffWorkSplitMode })} options={(["equal", "percentage", "fixed"] as const).map((value) => ({ value, label: t(`admin.staff.split.${value}`) }))} />
  <fieldset><legend className="mb-2 text-sm font-medium">{t("admin.staff.performers")}</legend><div className="space-y-2">{employees.filter((item) => item.status === "active").map((item) => { const selected = work.performers.find((performer) => performer.employeeId === item.id); return <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_8rem]"><div><Checkbox label={`${item.firstName} ${item.lastName}`} checked={Boolean(selected)} onChange={(event) => togglePerformer(item.id, event.target.checked)} />{selected && <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-muted"><input type="radio" name="primary-performer" checked={selected.isPrimary} onChange={() => setPrimaryPerformer(item.id)} />{t("admin.staff.primaryPerformer")}</label>}</div>{selected && work.splitMode !== "equal" && <Input aria-label={`${item.firstName} ${work.splitMode}`} type="number" min="0" step="0.01" value={work.splitMode === "percentage" ? selected.percentage ?? "" : selected.amount ?? ""} onChange={(event) => setShare(item.id, work.splitMode === "percentage" ? "percentage" : "amount", Number(event.target.value))} />}</div>; })}</div></fieldset>
  <details className="border border-border p-3" open={Boolean(work.materials?.length)}><summary className="cursor-pointer font-medium">{t("admin.staff.materials")}</summary><div className="mt-3 space-y-2">{work.materials?.map((material, index) => <div key={`${material.id}-${index}`} className="grid items-end gap-2 sm:grid-cols-[1fr_7rem]"><p className="text-sm">{material.itemType}: {material.itemId}</p><Input type="number" min="0" step="0.01" label={t("admin.staff.quantity")} value={material.quantity} onChange={(event) => setWork((current) => ({ ...current, materials: current.materials?.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Number(event.target.value) } : item) }))} /></div>)}{!work.materials?.length && <p className="text-sm text-muted">{t("admin.staff.noMaterials")}</p>}</div></details>
  <Textarea label={t("admin.staff.notes")} value={work.notes} onChange={(event) => setWork({ ...work, notes: event.target.value })} /><div className="grid gap-3 sm:grid-cols-2"><Input label={t("admin.staff.appointmentId")} value={work.appointmentId ?? ""} onChange={(event) => setWork({ ...work, appointmentId: event.target.value || undefined })} /><Input label={t("admin.staff.customerId")} value={work.customerId ?? ""} onChange={(event) => setWork({ ...work, customerId: event.target.value || undefined })} /><Input label={t("admin.staff.orderId")} value={work.orderId ?? ""} onChange={(event) => setWork({ ...work, orderId: event.target.value || undefined })} /><Input label={t("admin.staff.paymentId")} value={work.paymentId ?? ""} onChange={(event) => setWork({ ...work, paymentId: event.target.value || undefined })} /></div><Button type="submit">{t("admin.staff.createWork")}</Button>
</form></AdminCard>;

const WorkList = ({ records, canApprove, canEdit, onStatus, onCorrect, t, empty }: { records: T_StaffWorkRecord[]; canApprove: boolean; canEdit: boolean; onStatus: (record: T_StaffWorkRecord, status: T_StaffWorkStatus) => void; onCorrect: (record: T_StaffWorkRecord, values: { quantity: number; unitPrice: number; discount: number; notes: string; reason: string }) => Promise<boolean>; t: T_Translate; empty?: string }) => <AdminCard title={t("admin.staff.workHistory")}><div className="space-y-3">{records.map((record) => <article key={record.id} className="border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{record.service.title}</h3><p className="text-sm text-muted">{record.performers.map((item) => `${item.employeeName} (${(item.percentage ?? 0).toFixed(1)}%)`).join(", ")} / {new Date(record.performedAt).toLocaleString()}</p></div><strong>{record.totalAmount.toFixed(2)} {record.currency}</strong></div><p className="mt-2 text-sm">{t(`admin.staff.workStatus.${record.status}`)} / {record.durationMinutes} min / {record.quantity}</p>{record.notes && <p className="mt-2 text-sm text-muted">{record.notes}</p>}<div className="mt-3 flex flex-wrap gap-2">{nextStatuses(record.status).filter((status): status is keyof typeof actionKeys => status !== "planned").filter((status) => status !== "approved" || canApprove).filter((status) => status === "approved" || canEdit).map((status) => <Button key={status} type="button" variant={status === "void" ? "danger" : "secondary"} className="h-9" onClick={() => onStatus(record, status)}>{t(actionKeys[status])}</Button>)}</div>{canEdit && !["approved", "void"].includes(record.status) && <CorrectionForm record={record} onCorrect={onCorrect} t={t} />}<details className="mt-3"><summary className="cursor-pointer text-sm text-muted">{t("admin.staff.audit")}</summary><div className="mt-2 space-y-1">{record.audit.map((entry) => <p key={entry.id} className="text-xs text-muted">{t(`admin.staff.auditAction.${entry.action}`)} / {entry.createdBy} / {new Date(entry.createdAt).toLocaleString()} / {entry.note}</p>)}</div></details></article>)}{!records.length && <p className="text-sm text-muted">{empty ?? t("admin.staff.emptyWork")}</p>}</div></AdminCard>;

const CorrectionForm = ({ record, onCorrect, t }: { record: T_StaffWorkRecord; onCorrect: (record: T_StaffWorkRecord, values: { quantity: number; unitPrice: number; discount: number; notes: string; reason: string }) => Promise<boolean>; t: T_Translate }) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ quantity: record.quantity, unitPrice: record.unitPrice, discount: record.discount, notes: record.notes, reason: "" });
  return <div className="mt-3"><Button type="button" variant="ghost" className="h-9" onClick={() => setOpen((current) => !current)}>{t("admin.staff.correct")}</Button>{open && <form className="mt-3 grid gap-3 border-l-2 border-accent pl-3" onSubmit={async (event) => { event.preventDefault(); if (await onCorrect(record, values)) setOpen(false); }}><div className="grid gap-3 sm:grid-cols-3"><Input required type="number" min="1" label={t("admin.staff.quantity")} value={values.quantity} onChange={(event) => setValues({ ...values, quantity: Number(event.target.value) })} /><Input required type="number" min="0" step="0.01" label={t("admin.staff.price")} value={values.unitPrice} onChange={(event) => setValues({ ...values, unitPrice: Number(event.target.value) })} /><Input required type="number" min="0" max="100" label={t("admin.staff.discount")} value={values.discount} onChange={(event) => setValues({ ...values, discount: Number(event.target.value) })} /></div><Textarea label={t("admin.staff.notes")} value={values.notes} onChange={(event) => setValues({ ...values, notes: event.target.value })} /><Textarea required label={t("admin.staff.correctionReason")} value={values.reason} onChange={(event) => setValues({ ...values, reason: event.target.value })} /><div className="flex gap-2"><Button type="submit">{t("admin.staff.saveCorrection")}</Button><Button type="button" variant="secondary" onClick={() => setOpen(false)}>{t("admin.actions.cancel")}</Button></div></form>}</div>;
};

const AppointmentList = ({ appointments, services, t }: { appointments: T_ServicesState["appointments"]; services: T_ServicesState; t: T_Translate }) => <AdminCard title={t("admin.staff.appointments")}><div className="grid gap-3 md:grid-cols-2">{appointments.map((appointment) => <article key={appointment.id} className="border border-border p-3"><h3 className="font-semibold">{services.services.find((service) => service.id === appointment.serviceId)?.title ?? appointment.serviceId}</h3><p className="text-sm text-muted">{appointment.customerName} / {new Date(appointment.startAt).toLocaleString()}</p><p className="mt-1 text-sm">{appointment.status}</p></article>)}{!appointments.length && <p className="text-sm text-muted">{t("admin.staff.emptyAppointments")}</p>}</div></AdminCard>;
const Reports = ({ employees, t }: { employees: Array<{ employee: T_Employee; completed: number; approved: number; revenueByCurrency: Record<string, number> }>; t: T_Translate }) => <AdminCard title={t("admin.staff.reports")}><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b border-border"><th className="p-3">{t("admin.staff.employee")}</th><th className="p-3">{t("admin.staff.completed")}</th><th className="p-3">{t("admin.staff.approved")}</th><th className="p-3">{t("admin.staff.revenue")}</th></tr></thead><tbody>{employees.map((item) => <tr key={item.employee.id} className="border-b border-border"><td className="p-3 font-medium">{item.employee.firstName} {item.employee.lastName}</td><td className="p-3">{item.completed}</td><td className="p-3">{item.approved}</td><td className="p-3">{Object.entries(item.revenueByCurrency).map(([currency, amount]) => `${amount.toFixed(2)} ${currency}`).join(", ") || "-"}</td></tr>)}</tbody></table></div></AdminCard>;
