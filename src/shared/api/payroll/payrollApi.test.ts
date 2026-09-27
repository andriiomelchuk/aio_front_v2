import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { changeStaffWorkStatus, createStaffWork, saveEmployee } from "@/shared/api/staffWork";
import { changePayrollStatus, createPayrollAdjustment, createPayrollPeriod, getPayrollState, recalculatePayrollPeriod, savePayRatePlan, saveTimesheetEntry } from ".";
import { hasAdminPermission } from "@/shared/config/adminPermissions";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, clear: () => values.clear(), getItem: (key) => values.get(key) ?? null, key: (index) => [...values.keys()][index] ?? null, removeItem: (key) => { values.delete(key); }, setItem: (key, value) => { values.set(key, value); } };
};

let sequence = 0;
beforeEach(() => {
  sequence = 0; const localStorage = createStorage();
  vi.stubGlobal("localStorage", localStorage); vi.stubGlobal("window", { localStorage, dispatchEvent: vi.fn() }); vi.stubGlobal("crypto", { randomUUID: () => `payroll-test-${sequence += 1}` });
});
afterEach(() => vi.unstubAllGlobals());

const employeeInput = (email = "worker@example.com") => ({ firstName: "Payroll", lastName: "Worker", email, phone: "", status: "active" as const, roleIds: ["manager" as const], branchIds: ["central"], serviceCategoryIds: [], skills: [], schedule: [], notes: "" });
const rateInput = (employeeId: string, type: "hourly" | "percentage" = "hourly") => ({ key: `${type}-worker`, name: `${type} rate`, status: "active" as const, type, amount: type === "hourly" ? 20 : 0, percentage: type === "percentage" ? 20 : 0, currency: "EUR", overtimeMultiplier: 1.5, jointWorkRule: "use_work_share" as const, target: { employeeIds: [employeeId], roleIds: [], branchIds: [], serviceIds: [] }, effectiveFrom: "2026-01-01", notes: "", updatedBy: "Owner" });

describe("payroll API", () => {
  it("restricts payroll data and approval to authorized roles", () => {
    expect(hasAdminPermission("viewer", "payroll", "view")).toBe(false);
    expect(hasAdminPermission("manager", "payroll", "edit")).toBe(true);
    expect(hasAdminPermission("manager", "payroll", "approve")).toBe(false);
    expect(hasAdminPermission("admin", "payroll", "approve")).toBe(true);
  });

  it("calculates regular and overtime hours from timesheets", async () => {
    const employee = await saveEmployee(employeeInput()); await savePayRatePlan(rateInput(employee.id));
    await saveTimesheetEntry({ employeeId: employee.id, date: "2026-09-20", scheduledMinutes: 480, actualMinutes: 600, note: "Long shift", updatedBy: "Manager" });
    const period = await createPayrollPeriod({ name: "September", startDate: "2026-09-01", endDate: "2026-09-30", currency: "EUR", roundingMode: "nearest_cent", taxPlaceholderPercentage: 0, createdBy: "Owner" });
    expect(period.statements[0]).toMatchObject({ scheduledMinutes: 480, actualMinutes: 600, overtimeMinutes: 120, grossAmount: 220, netAmount: 220 });
    expect(period.statements[0].lines[0].rate).toMatchObject({ type: "hourly", version: 1, amount: 20 });
  });

  it("calculates percentage compensation from approved work and preserves the rate snapshot", async () => {
    const employee = await saveEmployee(employeeInput()); const rate = await savePayRatePlan(rateInput(employee.id, "percentage"));
    const work = await createStaffWork({ serviceId: "service-consultation", performedAt: "2026-09-20T10:00:00.000Z", quantity: 1, discount: 0, notes: "", splitMode: "equal", performers: [{ employeeId: employee.id }], createdBy: "Manager" });
    await changeStaffWorkStatus({ id: work.id, status: "in_progress", updatedBy: "Worker", note: "Start" }); await changeStaffWorkStatus({ id: work.id, status: "completed", updatedBy: "Worker", note: "Done" }); await changeStaffWorkStatus({ id: work.id, status: "approved", updatedBy: "Owner", note: "Approved" });
    const period = await createPayrollPeriod({ name: "September", startDate: "2026-09-01", endDate: "2026-09-30", currency: "EUR", roundingMode: "nearest_cent", taxPlaceholderPercentage: 0, createdBy: "Owner" });
    expect(period.statements[0].grossAmount).toBe(10);
    expect(period.statements[0].lines[0].rate).toMatchObject({ id: rate.id, percentage: 20, version: 1 });

    await savePayRatePlan({ ...rate, id: rate.id, percentage: 30, effectiveFrom: "2026-10-01", updatedBy: "Owner" });
    const stored = await getPayrollState(); expect(stored.periods[0].statements[0].lines[0].rate).toMatchObject({ percentage: 20, version: 1 });
    const recalculated = await recalculatePayrollPeriod(period.id, "Owner", "Historical check");
    expect(recalculated.statements[0].lines[0].rate).toMatchObject({ percentage: 20, version: 1 });
  });

  it("uses the most specific employee rate instead of a generic rate", async () => {
    const employee = await saveEmployee(employeeInput());
    await savePayRatePlan({ ...rateInput(employee.id), key: "generic", name: "Generic", amount: 10, target: { employeeIds: [], roleIds: [], branchIds: [], serviceIds: [] } });
    await savePayRatePlan({ ...rateInput(employee.id), key: "individual", name: "Individual", amount: 25 });
    await saveTimesheetEntry({ employeeId: employee.id, date: "2026-09-20", scheduledMinutes: 60, actualMinutes: 60, note: "", updatedBy: "Manager" });
    const period = await createPayrollPeriod({ name: "September", startDate: "2026-09-01", endDate: "2026-09-30", currency: "EUR", roundingMode: "nearest_cent", taxPlaceholderPercentage: 0, createdBy: "Owner" });
    expect(period.statements[0].grossAmount).toBe(25); expect(period.statements[0].lines[0].rate?.name).toBe("Individual");
  });

  it("locks approved periods and keeps later corrections as adjustment entries", async () => {
    const employee = await saveEmployee(employeeInput()); await savePayRatePlan(rateInput(employee.id));
    await saveTimesheetEntry({ employeeId: employee.id, date: "2026-09-20", scheduledMinutes: 60, actualMinutes: 60, note: "", updatedBy: "Manager" });
    const period = await createPayrollPeriod({ name: "September", startDate: "2026-09-01", endDate: "2026-09-30", currency: "EUR", roundingMode: "nearest_cent", taxPlaceholderPercentage: 10, createdBy: "Owner" });
    await changePayrollStatus({ id: period.id, status: "review", updatedBy: "Manager", note: "Review" }); await changePayrollStatus({ id: period.id, status: "approved", updatedBy: "Owner", note: "Approved" });
    await expect(recalculatePayrollPeriod(period.id, "Owner", "Late change")).rejects.toThrow("locked");
    await createPayrollAdjustment({ employeeId: employee.id, date: "2026-10-01", type: "bonus", amount: 15, currency: "EUR", note: "Correction for September", referencePeriodId: period.id, createdBy: "Owner" });
    const next = await createPayrollPeriod({ name: "October", startDate: "2026-10-01", endDate: "2026-10-31", currency: "EUR", roundingMode: "nearest_cent", taxPlaceholderPercentage: 0, createdBy: "Owner" });
    expect(next.statements[0]).toMatchObject({ grossAmount: 0, adjustmentAmount: 15, netAmount: 15 });
  });

  it.each([
    ["shift", 35],
    ["fixed_salary", 1000],
  ] as const)("calculates %s base rates", async (type, expected) => {
    const employee = await saveEmployee(employeeInput());
    await savePayRatePlan({ ...rateInput(employee.id), key: type, name: type, type, amount: expected, overtimeMultiplier: 1.5 });
    await saveTimesheetEntry({ employeeId: employee.id, date: "2026-09-20", scheduledMinutes: 480, actualMinutes: 480, note: "", updatedBy: "Manager" });
    const period = await createPayrollPeriod({ name: "September", startDate: "2026-09-01", endDate: "2026-09-30", currency: "EUR", roundingMode: "nearest_cent", taxPlaceholderPercentage: 0, createdBy: "Owner" });
    expect(period.statements[0].grossAmount).toBe(expected);
  });

  it.each([
    ["per_service", 12, 0, 12],
    ["commission", 0, 20, 10],
    ["combined", 5, 20, 15],
  ] as const)("calculates %s service rates", async (type, amount, percentage, expected) => {
    const employee = await saveEmployee(employeeInput());
    await savePayRatePlan({ ...rateInput(employee.id), key: type, name: type, type, amount, percentage, target: { employeeIds: [employee.id], roleIds: [], branchIds: [], serviceIds: ["service-consultation"] } });
    const work = await createStaffWork({ serviceId: "service-consultation", performedAt: "2026-09-20T10:00:00.000Z", quantity: 1, discount: 0, notes: "", splitMode: "equal", performers: [{ employeeId: employee.id }], createdBy: "Manager" });
    await changeStaffWorkStatus({ id: work.id, status: "in_progress", updatedBy: "Worker", note: "Start" }); await changeStaffWorkStatus({ id: work.id, status: "completed", updatedBy: "Worker", note: "Done" }); await changeStaffWorkStatus({ id: work.id, status: "approved", updatedBy: "Owner", note: "Approved" });
    const period = await createPayrollPeriod({ name: "September", startDate: "2026-09-01", endDate: "2026-09-30", currency: "EUR", roundingMode: "nearest_cent", taxPlaceholderPercentage: 0, createdBy: "Owner" });
    expect(period.statements[0].grossAmount).toBe(expected);
  });

  it("can pay joint work only to the primary performer", async () => {
    const primary = await saveEmployee(employeeInput("primary@example.com")); const assistant = await saveEmployee(employeeInput("assistant@example.com"));
    await savePayRatePlan({ ...rateInput(primary.id, "percentage"), key: "primary-only", target: { employeeIds: [], roleIds: [], branchIds: [], serviceIds: ["service-consultation"] }, jointWorkRule: "primary_only" });
    const work = await createStaffWork({ serviceId: "service-consultation", performedAt: "2026-09-20T10:00:00.000Z", quantity: 1, discount: 0, notes: "", splitMode: "equal", performers: [{ employeeId: primary.id, isPrimary: true }, { employeeId: assistant.id, isPrimary: false }], createdBy: "Manager" });
    await changeStaffWorkStatus({ id: work.id, status: "in_progress", updatedBy: "Worker", note: "Start" }); await changeStaffWorkStatus({ id: work.id, status: "completed", updatedBy: "Worker", note: "Done" }); await changeStaffWorkStatus({ id: work.id, status: "approved", updatedBy: "Owner", note: "Approved" });
    const period = await createPayrollPeriod({ name: "September", startDate: "2026-09-01", endDate: "2026-09-30", currency: "EUR", roundingMode: "nearest_cent", taxPlaceholderPercentage: 0, createdBy: "Owner" });
    const amounts = Object.fromEntries(period.statements.map((statement) => [statement.employeeId, statement.grossAmount]));
    expect(amounts[primary.id]).toBe(10); expect(amounts[assistant.id]).toBe(0);
  });
});
