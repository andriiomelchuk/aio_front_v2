import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppointment, getAvailableServiceSlots, getServicesState, saveService, saveServiceCategory, saveServiceProvider, ServicesApiError, updateAppointment } from ".";
import { createInventoryItem, createWarehouse, getWarehouseState, recordInventoryMovement } from "@/shared/api/warehouse";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, clear: () => values.clear(), getItem: (key) => values.get(key) ?? null, key: (index) => [...values.keys()][index] ?? null, removeItem: (key) => { values.delete(key); }, setItem: (key, value) => { values.set(key, value); } };
};
const setup = () => vi.stubGlobal("window", { localStorage: createStorage(), dispatchEvent: vi.fn() });
afterEach(() => vi.unstubAllGlobals());

const findAvailableSlot = async (serviceId: string, providerId: string, locationId: string) => {
  let date = new Date(Date.now() + 86_400_000);
  for (let attempt = 0; attempt < 14; attempt += 1) {
    const slots = await getAvailableServiceSlots(serviceId, providerId, locationId, date.toISOString().slice(0, 10));
    if (slots.length) return slots[0];
    date = new Date(date.getTime() + 86_400_000);
  }
  throw new Error("No available slot found for the test");
};

describe("services API", () => {
  it("persists service categories through the API contract", async () => {
    setup();
    await saveServiceCategory({ name: "Repair", slug: "repair", status: "active" });
    await expect(getServicesState()).resolves.toMatchObject({ categories: expect.arrayContaining([expect.objectContaining({ slug: "repair" })]) });
  });

  it("creates an appointment in an available slot and prevents double booking", async () => {
    setup();
    const state = await getServicesState();
    const service = state.services[0]; const provider = state.providers[0]; const location = state.locations[0];
    const slot = await findAvailableSlot(service.id, provider.id, location.id);
    const input = { serviceId: service.id, addOnIds: [], providerId: provider.id, locationId: location.id, customerName: "Alex", customerEmail: "alex@example.com", customerPhone: "", startAt: slot, timezone: location.timezone, customerNote: "" };
    await expect(createAppointment(input)).resolves.toMatchObject({ status: "pending", customerName: "Alex" });
    await expect(createAppointment(input)).rejects.toBeInstanceOf(ServicesApiError);
  });

  it("removes provider blocked time from available slots", async () => {
    setup();
    const state = await getServicesState();
    const service = state.services[0]; const provider = state.providers[0]; const location = state.locations[0];
    const slot = await findAvailableSlot(service.id, provider.id, location.id);
    await saveServiceProvider({ ...provider, blockedSlots: [{ id: "blocked-test", startAt: slot, endAt: new Date(new Date(slot).getTime() + 60 * 60_000).toISOString(), reason: "Holiday" }] });
    await expect(getAvailableServiceSlots(service.id, provider.id, location.id, slot.slice(0, 10))).resolves.not.toContain(slot);
  });

  it("requires a cancellation reason and records it in status history", async () => {
    setup();
    const state = await getServicesState();
    const service = state.services[0]; const provider = state.providers[0]; const location = state.locations[0];
    const slot = await findAvailableSlot(service.id, provider.id, location.id);
    const appointment = await createAppointment({ serviceId: service.id, addOnIds: [], providerId: provider.id, locationId: location.id, customerName: "Alex", customerEmail: "alex@example.com", customerPhone: "", startAt: slot, timezone: location.timezone, customerNote: "" });
    await expect(updateAppointment({ id: appointment.id, status: "cancelled", updatedBy: "Manager" })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(updateAppointment({ id: appointment.id, status: "cancelled", cancellationReason: "Customer request", updatedBy: "Manager" })).resolves.toMatchObject({ status: "cancelled", cancellationReason: "Customer request", statusHistory: expect.arrayContaining([expect.objectContaining({ note: "Customer request" })]) });
  });

  it("writes configured materials off when an appointment is completed", async () => {
    setup();
    const warehouse = await createWarehouse({ name: "Main", code: "main", address: "", locationName: "Shelf", locationCode: "a" }); const location = warehouse.locations[0];
    const material = await createInventoryItem({ name: "Lotion", sku: "lotion", unit: "ml", lowStockThreshold: 10 });
    await recordInventoryMovement({ type: "receipt", itemType: "consumable", productId: material.id, quantity: 100, reason: "Delivery", createdBy: "Manager", toWarehouseId: warehouse.id, toLocationId: location.id });
    const state = await getServicesState(); const current = state.services[0]; const { createdAt: _createdAt, updatedAt: _updatedAt, ...serviceInput } = current; void _createdAt; void _updatedAt;
    await saveService({ ...serviceInput, materials: [{ id: "material-link", itemType: "consumable", itemId: material.id, quantity: 25, warehouseId: warehouse.id, locationId: location.id }] });
    const slot = await findAvailableSlot(current.id, state.providers[0].id, state.locations[0].id);
    const appointment = await createAppointment({ serviceId: current.id, addOnIds: [], providerId: state.providers[0].id, locationId: state.locations[0].id, customerName: "Alex", customerEmail: "alex@example.com", customerPhone: "", startAt: slot, timezone: state.locations[0].timezone, customerNote: "" });
    const completed = await updateAppointment({ id: appointment.id, status: "completed", updatedBy: "Manager" });
    await updateAppointment({ id: appointment.id, status: "completed", updatedBy: "Manager" });
    expect(completed.materialsConsumedAt).toBeTruthy();
    const warehouseState = await getWarehouseState();
    expect(warehouseState.balances[0].physical).toBe(75);
    expect(warehouseState.movements.filter((item) => item.reference === appointment.id)).toHaveLength(1);
  });
});
