import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { changeStaffWorkStatus, createStaffWork, getEmployeeReport, getStaffWorkState, saveEmployee, StaffWorkApiError, updateStaffWork } from ".";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, clear: () => values.clear(), getItem: (key) => values.get(key) ?? null, key: (index) => [...values.keys()][index] ?? null, removeItem: (key) => { values.delete(key); }, setItem: (key, value) => { values.set(key, value); } };
};

let sequence = 0;
beforeEach(() => {
  sequence = 0;
  const localStorage = createStorage();
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage, dispatchEvent: vi.fn() });
  vi.stubGlobal("crypto", { randomUUID: () => `staff-test-${sequence += 1}` });
});
afterEach(() => vi.unstubAllGlobals());

const employeeInput = (email: string, firstName: string) => ({ firstName, lastName: "Worker", email, phone: "", status: "active" as const, roleIds: ["viewer" as const], branchIds: ["central"], serviceCategoryIds: ["service-category-consultations"], skills: ["consultation"], schedule: [], notes: "" });
const baseWork = (employeeId: string) => ({ serviceId: "service-consultation", performedAt: "2026-09-27T12:00:00.000Z", quantity: 2, discount: 10, notes: "Customer visit", splitMode: "equal" as const, performers: [{ employeeId }], createdBy: "Manager" });

describe("staff work API", () => {
  it("stores an employee with a default schedule and rejects duplicate email", async () => {
    const employee = await saveEmployee(employeeInput("alex@example.com", "Alex"));
    expect(employee.schedule).toHaveLength(7);
    await expect(saveEmployee(employeeInput("ALEX@example.com", "Other"))).rejects.toBeInstanceOf(StaffWorkApiError);
  });

  it("snapshots a service and calculates equal performer shares", async () => {
    const first = await saveEmployee(employeeInput("first@example.com", "First"));
    const second = await saveEmployee(employeeInput("second@example.com", "Second"));
    const record = await createStaffWork({ ...baseWork(first.id), performers: [{ employeeId: first.id }, { employeeId: second.id }] });

    expect(record.service).toMatchObject({ id: "service-consultation", title: "Personal consultation", price: 50 });
    expect(record.totalAmount).toBe(90);
    expect(record.performers).toEqual(expect.arrayContaining([
      expect.objectContaining({ isPrimary: true, percentage: 50, amount: 45 }),
      expect.objectContaining({ percentage: 50, amount: 45 }),
    ]));
    await changeStaffWorkStatus({ id: record.id, status: "in_progress", updatedBy: "Worker", note: "Started" });
    await changeStaffWorkStatus({ id: record.id, status: "completed", updatedBy: "Worker", note: "Completed" });
    await changeStaffWorkStatus({ id: record.id, status: "approved", updatedBy: "Owner", note: "Approved" });
    const report = await getEmployeeReport();
    expect(report.map((item) => item.approvedRevenueByCurrency)).toEqual([{ EUR: 45 }, { EUR: 45 }]);
  });

  it("requires percentage and fixed shares to match the work total", async () => {
    const employee = await saveEmployee(employeeInput("shares@example.com", "Shares"));
    await expect(createStaffWork({ ...baseWork(employee.id), splitMode: "percentage", performers: [{ employeeId: employee.id, percentage: 80 }] })).rejects.toThrow("100 percent");
    await expect(createStaffWork({ ...baseWork(employee.id), splitMode: "fixed", performers: [{ employeeId: employee.id, amount: 20 }] })).rejects.toThrow("work total");
  });

  it("audits corrections and locks approved work", async () => {
    const employee = await saveEmployee(employeeInput("audit@example.com", "Audit"));
    const created = await createStaffWork(baseWork(employee.id));
    const corrected = await updateStaffWork({ id: created.id, quantity: 1, reason: "Quantity entered twice", updatedBy: "Owner" });
    expect(corrected).toMatchObject({ quantity: 1, totalAmount: 45 });
    expect(corrected.audit[0]).toMatchObject({ action: "correct", createdBy: "Owner", note: "Quantity entered twice" });
    expect(corrected.audit[0].snapshot).toMatchObject({ totalAmount: 45, status: "planned" });

    await changeStaffWorkStatus({ id: created.id, status: "in_progress", updatedBy: "Worker", note: "Started" });
    await changeStaffWorkStatus({ id: created.id, status: "completed", updatedBy: "Worker", note: "Completed" });
    await changeStaffWorkStatus({ id: created.id, status: "approved", updatedBy: "Owner", note: "Approved" });
    await expect(updateStaffWork({ id: created.id, notes: "Changed", reason: "Late edit", updatedBy: "Owner" })).rejects.toThrow("cannot be corrected");
    const state = await getStaffWorkState();
    expect(state.workRecords[0].status).toBe("approved");
    expect(state.workRecords[0].audit.map((entry) => entry.action)).toEqual(["approve", "complete", "start", "correct", "create"]);
  });
});
