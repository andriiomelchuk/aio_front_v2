import type { T_StaffRole } from "@/shared/config/adminRoles";

export type T_PayRateType = "hourly" | "shift" | "fixed_salary" | "per_service" | "percentage" | "commission" | "combined";
export type T_PayrollStatus = "draft" | "review" | "approved" | "paid" | "cancelled";
export type T_PayrollAdjustmentType = "bonus" | "tip" | "penalty" | "advance" | "manual";
export type T_PayrollRoundingMode = "nearest_cent" | "whole";
export type T_JointWorkRule = "use_work_share" | "equal" | "primary_only";

export type T_PayRateTarget = {
  employeeIds: string[];
  roleIds: T_StaffRole[];
  branchIds: string[];
  serviceIds: string[];
};

export type T_PayRatePlan = {
  id: string;
  key: string;
  name: string;
  status: "active" | "archived";
  type: T_PayRateType;
  amount: number;
  percentage: number;
  currency: string;
  overtimeMultiplier: number;
  jointWorkRule: T_JointWorkRule;
  target: T_PayRateTarget;
  effectiveFrom: string;
  effectiveTo?: string;
  version: number;
  supersedesId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type T_SavePayRatePlanDto = Omit<T_PayRatePlan, "id" | "version" | "createdAt" | "updatedAt"> & {
  id?: string;
  version?: number;
};

export type T_TimesheetEntry = {
  id: string;
  employeeId: string;
  date: string;
  scheduledMinutes: number;
  actualMinutes: number;
  overtimeMinutes: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type T_SaveTimesheetEntryDto = Omit<T_TimesheetEntry, "id" | "overtimeMinutes" | "createdAt" | "updatedAt"> & { id?: string };

export type T_PayrollAdjustment = {
  id: string;
  employeeId: string;
  date: string;
  type: T_PayrollAdjustmentType;
  amount: number;
  currency: string;
  note: string;
  referencePeriodId?: string;
  createdAt: string;
  createdBy: string;
};

export type T_CreatePayrollAdjustmentDto = Omit<T_PayrollAdjustment, "id" | "createdAt">;

export type T_PayRateSnapshot = Pick<T_PayRatePlan, "id" | "key" | "name" | "type" | "amount" | "percentage" | "currency" | "overtimeMultiplier" | "jointWorkRule" | "version" | "effectiveFrom" | "effectiveTo">;

export type T_PayrollLine = {
  id: string;
  sourceType: "work" | "timesheet" | "salary" | "adjustment";
  sourceId: string;
  label: string;
  date: string;
  quantity: number;
  amount: number;
  currency: string;
  rate?: T_PayRateSnapshot;
  workSnapshot?: { workTotal: number; employeeSharePercentage: number; employeeShareAmount: number };
};

export type T_PayrollEmployeeStatement = {
  employeeId: string;
  employeeName: string;
  scheduledMinutes: number;
  actualMinutes: number;
  overtimeMinutes: number;
  grossAmount: number;
  adjustmentAmount: number;
  taxPlaceholderAmount: number;
  netAmount: number;
  currency: string;
  lines: T_PayrollLine[];
};

export type T_PayrollAuditAction = "create" | "recalculate" | "submit" | "return" | "approve" | "pay" | "cancel";
export type T_PayrollAuditEntry = {
  id: string;
  action: T_PayrollAuditAction;
  createdAt: string;
  createdBy: string;
  note: string;
  status: T_PayrollStatus;
  totalAmount: number;
};

export type T_PayrollPeriod = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  currency: string;
  roundingMode: T_PayrollRoundingMode;
  taxPlaceholderPercentage: number;
  status: T_PayrollStatus;
  statements: T_PayrollEmployeeStatement[];
  totalGross: number;
  totalAdjustments: number;
  totalTaxPlaceholder: number;
  totalNet: number;
  audit: T_PayrollAuditEntry[];
  createdAt: string;
  updatedAt: string;
};

export type T_CreatePayrollPeriodDto = Pick<T_PayrollPeriod, "name" | "startDate" | "endDate" | "currency" | "roundingMode" | "taxPlaceholderPercentage"> & { createdBy: string };
export type T_ChangePayrollStatusDto = { id: string; status: T_PayrollStatus; updatedBy: string; note: string };

export type T_PayrollState = {
  ratePlans: T_PayRatePlan[];
  timesheets: T_TimesheetEntry[];
  adjustments: T_PayrollAdjustment[];
  periods: T_PayrollPeriod[];
};
