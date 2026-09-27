import type { T_Employee } from "@/entities/employee";
import type {
  T_ChangePayrollStatusDto, T_CreatePayrollAdjustmentDto, T_CreatePayrollPeriodDto,
  T_PayRatePlan, T_PayRateSnapshot, T_PayrollAdjustment, T_PayrollAuditAction,
  T_PayrollEmployeeStatement, T_PayrollLine, T_PayrollPeriod, T_PayrollState,
  T_SavePayRatePlanDto, T_SaveTimesheetEntryDto, T_TimesheetEntry,
} from "@/entities/payroll";
import type { T_StaffWorkRecord } from "@/entities/staffWork";
import { getStaffWorkState } from "@/shared/api/staffWork";

const STORAGE_KEY = "aio-payroll-v1";
export const PAYROLL_CHANGE_EVENT = "aio-payroll-change";
export class PayrollApiError extends Error {}

const uid = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now = () => new Date().toISOString();
const clone = <T>(value: T): T => structuredClone(value);
const emptyState = (): T_PayrollState => ({ ratePlans: [], timesheets: [], adjustments: [], periods: [] });
const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const inRange = (date: string, start: string, end: string) => date >= start && date <= end;
const overlaps = (leftStart: string, leftEnd: string, rightStart: string, rightEnd: string) => leftStart <= rightEnd && rightStart <= leftEnd;

const read = (): T_PayrollState => {
  if (typeof window === "undefined") return emptyState();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<T_PayrollState> | null;
    return parsed ? {
      ratePlans: Array.isArray(parsed.ratePlans) ? parsed.ratePlans.map((rate) => ({ ...rate, jointWorkRule: rate.jointWorkRule ?? "use_work_share" })) : [],
      timesheets: Array.isArray(parsed.timesheets) ? parsed.timesheets : [],
      adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : [],
      periods: Array.isArray(parsed.periods) ? parsed.periods : [],
    } : emptyState();
  } catch { return emptyState(); }
};
const write = (state: T_PayrollState) => {
  if (typeof window === "undefined") throw new PayrollApiError("Payroll storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(PAYROLL_CHANGE_EVENT));
};
const round = (value: number, mode: T_PayrollPeriod["roundingMode"]) => mode === "whole" ? Math.round(value) : Math.round((value + Number.EPSILON) * 100) / 100;
const rateSnapshot = (rate: T_PayRatePlan): T_PayRateSnapshot => ({ id: rate.id, key: rate.key, name: rate.name, type: rate.type, amount: rate.amount, percentage: rate.percentage, currency: rate.currency, overtimeMultiplier: rate.overtimeMultiplier, jointWorkRule: rate.jointWorkRule, version: rate.version, effectiveFrom: rate.effectiveFrom, effectiveTo: rate.effectiveTo });
const audit = (action: T_PayrollAuditAction, createdBy: string, note: string, period: Pick<T_PayrollPeriod, "status" | "totalNet">) => ({ id: uid(), action, createdAt: now(), createdBy, note, status: period.status, totalAmount: period.totalNet });

const validateRate = (input: T_SavePayRatePlanDto) => {
  if (!input.key.trim() || !input.name.trim()) throw new PayrollApiError("Rate key and name are required");
  if (!isDate(input.effectiveFrom) || (input.effectiveTo && (!isDate(input.effectiveTo) || input.effectiveTo < input.effectiveFrom))) throw new PayrollApiError("Rate effective dates are invalid");
  if (!Number.isFinite(input.amount) || input.amount < 0 || !Number.isFinite(input.percentage) || input.percentage < 0 || input.percentage > 100 || !Number.isFinite(input.overtimeMultiplier) || input.overtimeMultiplier < 1) throw new PayrollApiError("Rate values are invalid");
  if (!input.currency.trim()) throw new PayrollApiError("Rate currency is required");
};

const targetMatches = (rate: T_PayRatePlan, employee: T_Employee, serviceId?: string) => {
  const { target } = rate;
  return (!target.employeeIds.length || target.employeeIds.includes(employee.id))
    && (!target.roleIds.length || target.roleIds.some((role) => employee.roleIds.includes(role)))
    && (!target.branchIds.length || target.branchIds.some((branch) => employee.branchIds.includes(branch)))
    && (!target.serviceIds.length || Boolean(serviceId && target.serviceIds.includes(serviceId)));
};
const specificity = (rate: T_PayRatePlan) => (rate.target.employeeIds.length ? 100 : 0) + (rate.target.serviceIds.length ? 50 : 0) + (rate.target.roleIds.length ? 20 : 0) + (rate.target.branchIds.length ? 10 : 0);
const selectRate = (rates: T_PayRatePlan[], employee: T_Employee, date: string, currency: string, serviceId?: string) => rates
  .filter((rate) => (rate.status === "active" || Boolean(rate.effectiveTo)) && rate.currency === currency && rate.effectiveFrom <= date && (!rate.effectiveTo || rate.effectiveTo >= date) && targetMatches(rate, employee, serviceId))
  .sort((left, right) => specificity(right) - specificity(left) || right.version - left.version || right.effectiveFrom.localeCompare(left.effectiveFrom))[0];

const workLine = (work: T_StaffWorkRecord, employee: T_Employee, rate: T_PayRatePlan, roundingMode: T_PayrollPeriod["roundingMode"]): T_PayrollLine | null => {
  const performer = work.performers.find((item) => item.employeeId === employee.id);
  if (!performer) return null;
  const share = rate.jointWorkRule === "primary_only" ? performer.isPrimary ? 1 : 0 : rate.jointWorkRule === "equal" ? 1 / work.performers.length : (performer.percentage ?? 0) / 100;
  const sourceAmount = work.totalAmount * share;
  let amount = 0;
  if (rate.type === "per_service") amount = rate.amount * work.quantity * share;
  if (rate.type === "percentage" || rate.type === "commission") amount = sourceAmount * rate.percentage / 100;
  if (rate.type === "combined") amount = rate.amount * work.quantity * share + sourceAmount * rate.percentage / 100;
  if (!["per_service", "percentage", "commission", "combined"].includes(rate.type)) return null;
  return { id: uid(), sourceType: "work", sourceId: work.id, label: work.service.title, date: work.performedAt.slice(0, 10), quantity: work.quantity, amount: round(amount, roundingMode), currency: rate.currency, rate: rateSnapshot(rate), workSnapshot: { workTotal: work.totalAmount, employeeSharePercentage: share * 100, employeeShareAmount: sourceAmount } };
};

const calculateStatements = async (state: T_PayrollState, period: Pick<T_PayrollPeriod, "startDate" | "endDate" | "currency" | "roundingMode" | "taxPlaceholderPercentage">): Promise<T_PayrollEmployeeStatement[]> => {
  const staff = await getStaffWorkState();
  const approvedWork = staff.workRecords.filter((work) => work.status === "approved" && inRange(work.performedAt.slice(0, 10), period.startDate, period.endDate) && work.currency === period.currency);
  const timesheets = state.timesheets.filter((entry) => inRange(entry.date, period.startDate, period.endDate));
  const adjustments = state.adjustments.filter((entry) => entry.currency === period.currency && inRange(entry.date, period.startDate, period.endDate));

  return staff.employees.filter((employee) => employee.status === "active" || approvedWork.some((work) => work.performers.some((performer) => performer.employeeId === employee.id)) || adjustments.some((item) => item.employeeId === employee.id)).map((employee) => {
    const ownTimesheets = timesheets.filter((entry) => entry.employeeId === employee.id);
    const ownWork = approvedWork.filter((work) => work.performers.some((performer) => performer.employeeId === employee.id));
    const ownAdjustments = adjustments.filter((entry) => entry.employeeId === employee.id);
    const lines: T_PayrollLine[] = [];

    ownWork.forEach((work) => {
      const rate = selectRate(state.ratePlans, employee, work.performedAt.slice(0, 10), period.currency, work.service.id);
      if (!rate) return;
      const line = workLine(work, employee, rate, period.roundingMode);
      if (line) lines.push(line);
    });

    const baseRate = selectRate(state.ratePlans.filter((rate) => !rate.target.serviceIds.length), employee, period.endDate, period.currency);
    if (baseRate?.type === "hourly") {
      const regularMinutes = ownTimesheets.reduce((sum, entry) => sum + Math.max(0, entry.actualMinutes - entry.overtimeMinutes), 0);
      const overtimeMinutes = ownTimesheets.reduce((sum, entry) => sum + entry.overtimeMinutes, 0);
      const amount = regularMinutes / 60 * baseRate.amount + overtimeMinutes / 60 * baseRate.amount * baseRate.overtimeMultiplier;
      lines.push({ id: uid(), sourceType: "timesheet", sourceId: ownTimesheets.map((entry) => entry.id).join(","), label: baseRate.name, date: period.endDate, quantity: (regularMinutes + overtimeMinutes) / 60, amount: round(amount, period.roundingMode), currency: period.currency, rate: rateSnapshot(baseRate) });
    } else if (baseRate?.type === "shift") {
      const shifts = new Set(ownTimesheets.filter((entry) => entry.actualMinutes > 0).map((entry) => entry.date)).size;
      lines.push({ id: uid(), sourceType: "timesheet", sourceId: ownTimesheets.map((entry) => entry.id).join(","), label: baseRate.name, date: period.endDate, quantity: shifts, amount: round(shifts * baseRate.amount, period.roundingMode), currency: period.currency, rate: rateSnapshot(baseRate) });
    } else if (baseRate?.type === "fixed_salary") {
      lines.push({ id: uid(), sourceType: "salary", sourceId: baseRate.id, label: baseRate.name, date: period.endDate, quantity: 1, amount: round(baseRate.amount, period.roundingMode), currency: period.currency, rate: rateSnapshot(baseRate) });
    }

    ownAdjustments.forEach((entry) => {
      const amount = entry.type === "penalty" || entry.type === "advance" ? -Math.abs(entry.amount) : entry.type === "manual" ? entry.amount : Math.abs(entry.amount);
      lines.push({ id: uid(), sourceType: "adjustment", sourceId: entry.id, label: entry.note || entry.type, date: entry.date, quantity: 1, amount: round(amount, period.roundingMode), currency: entry.currency });
    });

    const grossAmount = round(lines.filter((line) => line.sourceType !== "adjustment").reduce((sum, line) => sum + line.amount, 0), period.roundingMode);
    const adjustmentAmount = round(lines.filter((line) => line.sourceType === "adjustment").reduce((sum, line) => sum + line.amount, 0), period.roundingMode);
    const taxPlaceholderAmount = round(Math.max(0, grossAmount + adjustmentAmount) * period.taxPlaceholderPercentage / 100, period.roundingMode);
    return {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
      scheduledMinutes: ownTimesheets.reduce((sum, entry) => sum + entry.scheduledMinutes, 0),
      actualMinutes: ownTimesheets.reduce((sum, entry) => sum + entry.actualMinutes, 0),
      overtimeMinutes: ownTimesheets.reduce((sum, entry) => sum + entry.overtimeMinutes, 0),
      grossAmount, adjustmentAmount, taxPlaceholderAmount,
      netAmount: round(grossAmount + adjustmentAmount - taxPlaceholderAmount, period.roundingMode),
      currency: period.currency,
      lines,
    };
  }).filter((statement) => statement.lines.length || statement.actualMinutes || statement.scheduledMinutes);
};

const totals = (statements: T_PayrollEmployeeStatement[]) => ({
  totalGross: statements.reduce((sum, item) => sum + item.grossAmount, 0),
  totalAdjustments: statements.reduce((sum, item) => sum + item.adjustmentAmount, 0),
  totalTaxPlaceholder: statements.reduce((sum, item) => sum + item.taxPlaceholderAmount, 0),
  totalNet: statements.reduce((sum, item) => sum + item.netAmount, 0),
});

export const getPayrollState = async () => clone(read());

export const savePayRatePlan = async (input: T_SavePayRatePlanDto): Promise<T_PayRatePlan> => {
  validateRate(input);
  const state = read(); const current = input.id ? state.ratePlans.find((rate) => rate.id === input.id) : undefined; const timestamp = now();
  if (current && input.effectiveFrom <= current.effectiveFrom) throw new PayrollApiError("A new rate version must start after the current version");
  if (!current && state.ratePlans.some((rate) => rate.key === input.key && rate.version === (input.version ?? 1))) throw new PayrollApiError("Rate key and version already exist");
  const plan: T_PayRatePlan = { ...input, id: uid(), version: current ? current.version + 1 : input.version ?? 1, supersedesId: current?.id ?? input.supersedesId, createdAt: timestamp, updatedAt: timestamp };
  if (current) state.ratePlans = state.ratePlans.map((rate) => rate.id === current.id ? { ...rate, status: "archived", effectiveTo: new Date(Date.parse(`${input.effectiveFrom}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10), updatedAt: timestamp, updatedBy: input.updatedBy } : rate);
  state.ratePlans.unshift(plan); write(state); return clone(plan);
};

export const setPayRateStatus = async (id: string, status: T_PayRatePlan["status"], updatedBy: string) => {
  const state = read(); const rate = state.ratePlans.find((item) => item.id === id); if (!rate) throw new PayrollApiError("Rate plan not found");
  const updated = { ...rate, status, updatedAt: now(), updatedBy }; state.ratePlans = state.ratePlans.map((item) => item.id === id ? updated : item); write(state); return clone(updated);
};

export const saveTimesheetEntry = async (input: T_SaveTimesheetEntryDto): Promise<T_TimesheetEntry> => {
  if (!input.employeeId || !isDate(input.date) || [input.scheduledMinutes, input.actualMinutes].some((value) => !Number.isFinite(value) || value < 0)) throw new PayrollApiError("Timesheet values are invalid");
  const state = read(); const current = input.id ? state.timesheets.find((entry) => entry.id === input.id) : undefined;
  if (state.timesheets.some((entry) => entry.id !== input.id && entry.employeeId === input.employeeId && entry.date === input.date)) throw new PayrollApiError("A timesheet entry already exists for this employee and date");
  const timestamp = now(); const entry: T_TimesheetEntry = { ...input, id: current?.id ?? uid(), overtimeMinutes: Math.max(0, input.actualMinutes - input.scheduledMinutes), createdAt: current?.createdAt ?? timestamp, updatedAt: timestamp };
  state.timesheets = current ? state.timesheets.map((item) => item.id === current.id ? entry : item) : [entry, ...state.timesheets]; write(state); return clone(entry);
};

export const createPayrollAdjustment = async (input: T_CreatePayrollAdjustmentDto): Promise<T_PayrollAdjustment> => {
  if (!input.employeeId || !isDate(input.date) || !Number.isFinite(input.amount) || input.amount === 0 || !input.currency.trim() || !input.note.trim()) throw new PayrollApiError("Adjustment values and reason are required");
  const state = read(); const adjustment: T_PayrollAdjustment = { ...input, id: uid(), createdAt: now() }; state.adjustments.unshift(adjustment); write(state); return clone(adjustment);
};

export const createPayrollPeriod = async (input: T_CreatePayrollPeriodDto): Promise<T_PayrollPeriod> => {
  if (!input.name.trim() || !isDate(input.startDate) || !isDate(input.endDate) || input.endDate < input.startDate || !input.currency.trim() || input.taxPlaceholderPercentage < 0 || input.taxPlaceholderPercentage > 100) throw new PayrollApiError("Payroll period values are invalid");
  const state = read(); if (state.periods.some((period) => period.status !== "cancelled" && period.currency === input.currency && overlaps(period.startDate, period.endDate, input.startDate, input.endDate))) throw new PayrollApiError("Payroll periods cannot overlap");
  const statements = await calculateStatements(state, input); const periodTotals = totals(statements); const timestamp = now();
  const period: T_PayrollPeriod = { ...input, ...periodTotals, id: uid(), status: "draft", statements, audit: [], createdAt: timestamp, updatedAt: timestamp };
  period.audit = [audit("create", input.createdBy, input.name, period)]; state.periods.unshift(period); write(state); return clone(period);
};

export const recalculatePayrollPeriod = async (id: string, updatedBy: string, note: string) => {
  const state = read(); const current = state.periods.find((period) => period.id === id); if (!current) throw new PayrollApiError("Payroll period not found"); if (!["draft", "review"].includes(current.status)) throw new PayrollApiError("Approved, paid or cancelled payroll is locked");
  const statements = await calculateStatements(state, current); const updated: T_PayrollPeriod = { ...current, ...totals(statements), statements, updatedAt: now() };
  updated.audit = [audit("recalculate", updatedBy, note, updated), ...current.audit]; state.periods = state.periods.map((period) => period.id === id ? updated : period); write(state); return clone(updated);
};

const transitions: Record<T_PayrollPeriod["status"], T_PayrollPeriod["status"][]> = { draft: ["review", "cancelled"], review: ["draft", "approved", "cancelled"], approved: ["paid"], paid: [], cancelled: [] };
export const changePayrollStatus = async (input: T_ChangePayrollStatusDto) => {
  const state = read(); const current = state.periods.find((period) => period.id === input.id); if (!current) throw new PayrollApiError("Payroll period not found"); if (!transitions[current.status].includes(input.status)) throw new PayrollApiError("Invalid payroll status transition");
  const action: T_PayrollAuditAction = input.status === "review" ? "submit" : input.status === "draft" ? "return" : input.status === "approved" ? "approve" : input.status === "paid" ? "pay" : "cancel";
  const updated: T_PayrollPeriod = { ...current, status: input.status, updatedAt: now(), audit: current.audit };
  updated.audit = [audit(action, input.updatedBy, input.note, updated), ...current.audit]; state.periods = state.periods.map((period) => period.id === input.id ? updated : period); write(state); return clone(updated);
};

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
export const payrollPeriodToCsv = (period: T_PayrollPeriod) => {
  const rows = [["Employee", "Scheduled hours", "Actual hours", "Overtime hours", "Gross", "Adjustments", "Tax placeholder", "Net", "Currency"]];
  period.statements.forEach((statement) => rows.push([statement.employeeName, statement.scheduledMinutes / 60, statement.actualMinutes / 60, statement.overtimeMinutes / 60, statement.grossAmount, statement.adjustmentAmount, statement.taxPlaceholderAmount, statement.netAmount, statement.currency].map(String)));
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
};

export const employeePayslipToText = (period: T_PayrollPeriod, employeeId: string) => {
  const statement = period.statements.find((item) => item.employeeId === employeeId); if (!statement) throw new PayrollApiError("Employee statement not found");
  return [period.name, statement.employeeName, `${period.startDate} - ${period.endDate}`, "", ...statement.lines.map((line) => `${line.date} | ${line.label} | ${line.amount.toFixed(2)} ${line.currency}`), "", `Gross: ${statement.grossAmount.toFixed(2)} ${statement.currency}`, `Adjustments: ${statement.adjustmentAmount.toFixed(2)} ${statement.currency}`, `Tax placeholder: ${statement.taxPlaceholderAmount.toFixed(2)} ${statement.currency}`, `Net: ${statement.netAmount.toFixed(2)} ${statement.currency}`].join("\n");
};
