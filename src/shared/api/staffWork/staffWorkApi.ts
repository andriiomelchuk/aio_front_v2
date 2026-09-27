import type { T_Employee, T_SaveEmployeeDto } from "@/entities/employee";
import type { T_ChangeStaffWorkStatusDto, T_CreateStaffWorkDto, T_StaffWorkAuditAction, T_StaffWorkRecord, T_StaffWorkState, T_UpdateStaffWorkDto } from "@/entities/staffWork";
import { getServicesState } from "@/shared/api/services";

const STORAGE_KEY = "aio-staff-work-v1";
export const STAFF_WORK_CHANGE_EVENT = "aio-staff-work-change";
export class StaffWorkApiError extends Error {}
const uid = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now = () => new Date().toISOString();
const emptyState = (): T_StaffWorkState => ({ employees: [], workRecords: [] });
const clone = <T>(value: T): T => structuredClone(value);

const read = (): T_StaffWorkState => {
  if (typeof window === "undefined") return emptyState();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<T_StaffWorkState> | null;
    return parsed ? normalizeStoredState({ employees: Array.isArray(parsed.employees) ? parsed.employees : [], workRecords: Array.isArray(parsed.workRecords) ? parsed.workRecords : [] }) : emptyState();
  } catch { return emptyState(); }
};
const write = (state: T_StaffWorkState) => {
  if (typeof window === "undefined") throw new StaffWorkApiError("Staff work storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(STAFF_WORK_CHANGE_EVENT));
};
const defaultSchedule = () => Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: dayOfWeek > 0 && dayOfWeek < 6, periods: [{ start: "09:00", end: "18:00" }], breaks: [] }));
const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const validateEmployee = (input: T_SaveEmployeeDto) => {
  if (!input.firstName.trim() || !input.lastName.trim() || !input.email.trim()) throw new StaffWorkApiError("Employee name and email are required");
  if (!input.roleIds.length) throw new StaffWorkApiError("Select at least one role");
  if (input.schedule.length && (input.schedule.length !== 7 || new Set(input.schedule.map((day) => day.dayOfWeek)).size !== 7)) throw new StaffWorkApiError("Schedule must contain seven unique days");
  if (input.schedule.some((day) => day.enabled && (!day.periods.length || day.periods.some((period) => !validTime(period.start) || !validTime(period.end) || period.start >= period.end)))) throw new StaffWorkApiError("Schedule contains an invalid working period");
};
const calculateTotal = (quantity: number, unitPrice: number, discount: number) => Math.max(0, quantity * unitPrice * (1 - discount / 100));
const validateShares = (mode: T_StaffWorkRecord["splitMode"], performers: T_StaffWorkRecord["performers"], total: number) => {
  if (!performers.length || new Set(performers.map((item) => item.employeeId)).size !== performers.length) throw new StaffWorkApiError("Select unique performers");
  if (performers.filter((item) => item.isPrimary).length !== 1) throw new StaffWorkApiError("Select one primary performer");
  if (mode === "percentage" && Math.abs(performers.reduce((sum, item) => sum + (item.percentage ?? 0), 0) - 100) > 0.01) throw new StaffWorkApiError("Performer shares must total 100 percent");
  if (mode === "fixed" && Math.abs(performers.reduce((sum, item) => sum + (item.amount ?? 0), 0) - total) > 0.01) throw new StaffWorkApiError("Fixed shares must equal the work total");
};
const normalizeShares = (
  mode: T_StaffWorkRecord["splitMode"],
  performers: T_StaffWorkRecord["performers"],
  total: number,
) => performers.map((performer) => {
  if (mode === "equal") {
    const percentage = 100 / performers.length;
    return { ...performer, percentage, amount: total / performers.length };
  }
  if (mode === "percentage") {
    return { ...performer, amount: total * (performer.percentage ?? 0) / 100 };
  }
  return { ...performer, percentage: total > 0 ? (performer.amount ?? 0) / total * 100 : 0 };
});
const auditEntry = (action: T_StaffWorkAuditAction, createdBy: string, note: string, record: Pick<T_StaffWorkRecord, "status" | "totalAmount" | "performers">) => ({ id: uid(), action, createdAt: now(), createdBy, note, snapshot: clone(record) });
const normalizeStoredState = (state: T_StaffWorkState): T_StaffWorkState => ({
  employees: state.employees.map((employee) => ({ ...employee, schedule: employee.schedule?.length ? employee.schedule : defaultSchedule() })),
  workRecords: state.workRecords.map((record) => {
    const hasPrimary = record.performers.some((performer) => Boolean(performer.isPrimary));
    const performers = record.performers.map((performer, index) => ({ ...performer, isPrimary: hasPrimary ? Boolean(performer.isPrimary) : index === 0 }));
    return {
      ...record,
      performers,
      audit: (record.audit ?? []).map((entry) => ({
        ...entry,
        snapshot: entry.snapshot ?? { status: record.status, totalAmount: record.totalAmount, performers: clone(performers) },
      })),
    };
  }),
});

export const getStaffWorkState = async () => clone(read());
export const saveEmployee = async (input: T_SaveEmployeeDto): Promise<T_Employee> => {
  validateEmployee(input); const state = read(); const current = input.id ? state.employees.find((item) => item.id === input.id) : undefined; const timestamp = now();
  if (state.employees.some((item) => item.id !== input.id && item.email.toLowerCase() === input.email.trim().toLowerCase())) throw new StaffWorkApiError("An employee with this email already exists");
  const employee: T_Employee = { ...input, schedule: input.schedule.length ? input.schedule : defaultSchedule(), id: current?.id ?? uid(), createdAt: current?.createdAt ?? timestamp, updatedAt: timestamp };
  state.employees = current ? state.employees.map((item) => item.id === current.id ? employee : item) : [employee, ...state.employees]; write(state); return clone(employee);
};
export const createStaffWork = async (input: T_CreateStaffWorkDto): Promise<T_StaffWorkRecord> => {
  const state = read(); const services = await getServicesState(); const service = services.services.find((item) => item.id === input.serviceId); if (!service) throw new StaffWorkApiError("Service not found");
  const employees = new Map(state.employees.map((item) => [item.id, item]));
  const quantity = input.quantity; const unitPrice = input.unitPrice ?? service.price; const discount = input.discount; const total = calculateTotal(quantity, unitPrice, discount);
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0 || discount < 0 || discount > 100 || Number.isNaN(Date.parse(input.performedAt))) throw new StaffWorkApiError("Work values are invalid");
  if (input.performers.filter((item) => item.isPrimary).length > 1) throw new StaffWorkApiError("Select one primary performer");
  const hasPrimary = input.performers.some((item) => item.isPrimary);
  const performers = input.performers.map((item, index) => { const employee = employees.get(item.employeeId); if (!employee || employee.status !== "active") throw new StaffWorkApiError("Performer is unavailable"); return { ...item, isPrimary: hasPrimary ? Boolean(item.isPrimary) : index === 0, employeeName: `${employee.firstName} ${employee.lastName}`.trim() }; });
  validateShares(input.splitMode, performers, total); const timestamp = now();
  const record: T_StaffWorkRecord = { ...input, id: uid(), service: { id: service.id, title: service.title, categoryId: service.categoryId, price: service.price, currency: service.currency, durationMinutes: service.durationMinutes, materials: clone(service.materials) }, durationMinutes: input.durationMinutes ?? service.durationMinutes, unitPrice, totalAmount: total, currency: service.currency, materials: clone(input.materials ?? service.materials), performers: normalizeShares(input.splitMode, performers, total), status: "planned", audit: [], createdAt: timestamp, updatedAt: timestamp };
  record.audit = [auditEntry("create", input.createdBy, input.notes, record)];
  state.workRecords.unshift(record); write(state); return clone(record);
};
export const updateStaffWork = async (input: T_UpdateStaffWorkDto) => {
  const state = read(); const current = state.workRecords.find((item) => item.id === input.id); if (!current) throw new StaffWorkApiError("Work record not found"); if (["approved", "void"].includes(current.status)) throw new StaffWorkApiError("Approved or void work cannot be corrected");
  if (!input.reason.trim()) throw new StaffWorkApiError("Correction reason is required");
  const { id: _id, updatedBy, reason, ...patch } = input;
  void _id;
  const next: T_StaffWorkRecord = { ...current, ...patch, id: current.id, service: current.service, status: current.status, audit: current.audit, updatedAt: now() };
  next.totalAmount = calculateTotal(next.quantity, next.unitPrice, next.discount); validateShares(next.splitMode, next.performers, next.totalAmount);
  next.performers = normalizeShares(next.splitMode, next.performers, next.totalAmount);
  next.audit = [auditEntry("correct", updatedBy, reason, next), ...current.audit];
  state.workRecords = state.workRecords.map((item) => item.id === current.id ? next : item); write(state); return clone(next);
};
const transitions: Record<T_StaffWorkRecord["status"], T_StaffWorkRecord["status"][]> = { planned: ["in_progress", "void"], in_progress: ["completed", "void"], completed: ["approved", "in_progress", "void"], approved: [], void: [] };
export const changeStaffWorkStatus = async (input: T_ChangeStaffWorkStatusDto) => {
  const state = read(); const current = state.workRecords.find((item) => item.id === input.id); if (!current) throw new StaffWorkApiError("Work record not found"); if (!transitions[current.status].includes(input.status)) throw new StaffWorkApiError("Invalid work status transition");
  const action: T_StaffWorkAuditAction = input.status === "in_progress" ? "start" : input.status === "completed" ? "complete" : input.status === "approved" ? "approve" : "void";
  const updated: T_StaffWorkRecord = { ...current, status: input.status, audit: current.audit, updatedAt: now() };
  updated.audit = [auditEntry(action, input.updatedBy, input.note, updated), ...current.audit];
  state.workRecords = state.workRecords.map((item) => item.id === current.id ? updated : item); write(state); return clone(updated);
};
export const getEmployeeReport = async () => {
  const state = read(); return state.employees.map((employee) => { const records = state.workRecords.filter((item) => item.performers.some((performer) => performer.employeeId === employee.id)); const approved = records.filter((item) => item.status === "approved"); const approvedRevenueByCurrency = approved.reduce<Record<string, number>>((totals, record) => { const share = record.performers.find((performer) => performer.employeeId === employee.id)?.amount ?? 0; totals[record.currency] = (totals[record.currency] ?? 0) + share; return totals; }, {}); return { employee, completedCount: records.filter((item) => item.status === "completed" || item.status === "approved").length, approvedCount: approved.length, approvedRevenueByCurrency }; });
};
