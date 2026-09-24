import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWarehouse,
  createInventoryItem,
  consumeServiceMaterials,
  finalizeOrderStock,
  getProductInventory,
  getWarehouseState,
  recordInventoryMovement,
  replaceOrderStockReservation,
  reserveOrderStock,
} from "./warehouseApi";
import type { T_OrderItem } from "@/entities/order";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
};

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: createStorage(), dispatchEvent: vi.fn() });
});

afterEach(() => vi.unstubAllGlobals());

const createTestWarehouse = () => createWarehouse({
  name: "Main warehouse",
  code: "main",
  address: "Test street",
  locationName: "Shelf A",
  locationCode: "a-01",
});

describe("warehouse inventory", () => {
  it("records receipts, transfers and write-offs", async () => {
    const sourceWarehouse = await createTestWarehouse();
    const destinationWarehouse = await createWarehouse({
      name: "Second warehouse", code: "second", address: "", locationName: "Shelf B", locationCode: "b-01",
    });
    const sourceLocation = sourceWarehouse.locations[0];
    const destinationLocation = destinationWarehouse.locations[0];

    await recordInventoryMovement({
      type: "receipt", productId: "product-1", quantity: 10, reason: "Supplier delivery", createdBy: "Manager",
      toWarehouseId: sourceWarehouse.id, toLocationId: sourceLocation.id,
    });
    await recordInventoryMovement({
      type: "transfer", productId: "product-1", quantity: 4, reason: "Replenishment", createdBy: "Manager",
      fromWarehouseId: sourceWarehouse.id, fromLocationId: sourceLocation.id,
      toWarehouseId: destinationWarehouse.id, toLocationId: destinationLocation.id,
    });
    await recordInventoryMovement({
      type: "write_off", productId: "product-1", quantity: 1, reason: "Damaged", createdBy: "Manager",
      fromWarehouseId: destinationWarehouse.id, fromLocationId: destinationLocation.id,
    });

    expect(getProductInventory("product-1")).toMatchObject({ physical: 9, reserved: 0, available: 9 });
    expect((await getWarehouseState()).movements).toHaveLength(3);
  });

  it("does not write off stock reserved for an order", async () => {
    const warehouse = await createTestWarehouse();
    const location = warehouse.locations[0];
    await recordInventoryMovement({
      type: "receipt", productId: "product-1", quantity: 5, reason: "Delivery", createdBy: "Manager",
      toWarehouseId: warehouse.id, toLocationId: location.id,
    });
    reserveOrderStock("order-1", [{ productId: "product-1", title: "Product", quantity: 4 } as T_OrderItem]);

    await expect(recordInventoryMovement({
      type: "write_off", productId: "product-1", quantity: 2, reason: "Damaged", createdBy: "Manager",
      fromWarehouseId: warehouse.id, fromLocationId: location.id,
    })).rejects.toMatchObject({ code: "INSUFFICIENT_STOCK" });
  });

  it("reserves stock and turns the reservation into a sale", async () => {
    const warehouse = await createTestWarehouse();
    const location = warehouse.locations[0];
    await recordInventoryMovement({
      type: "receipt", productId: "product-1", quantity: 8, reason: "Delivery", createdBy: "Manager",
      toWarehouseId: warehouse.id, toLocationId: location.id,
    });

    reserveOrderStock("order-1", [{ productId: "product-1", title: "Product", quantity: 3 } as T_OrderItem]);
    expect(getProductInventory("product-1")).toMatchObject({ physical: 8, reserved: 3, available: 5 });

    finalizeOrderStock("order-1", "sale", "Manager");
    expect(getProductInventory("product-1")).toMatchObject({ physical: 5, reserved: 0, available: 5 });
    finalizeOrderStock("order-1", "sale", "Manager");
    expect(getProductInventory("product-1").physical).toBe(5);
  });

  it("releases stock when an order is cancelled", async () => {
    const warehouse = await createTestWarehouse();
    const location = warehouse.locations[0];
    await recordInventoryMovement({
      type: "receipt", productId: "product-1", quantity: 6, reason: "Delivery", createdBy: "Manager",
      toWarehouseId: warehouse.id, toLocationId: location.id,
    });
    reserveOrderStock("order-2", [{ productId: "product-1", title: "Product", quantity: 2 } as T_OrderItem]);
    finalizeOrderStock("order-2", "release", "Manager");

    expect(getProductInventory("product-1")).toMatchObject({ physical: 6, reserved: 0, available: 6 });
  });

  it("replaces an active order reservation before completing the sale", async () => {
    const warehouse = await createTestWarehouse();
    const location = warehouse.locations[0];
    await recordInventoryMovement({
      type: "receipt", productId: "product-1", quantity: 10, reason: "Delivery", createdBy: "Manager",
      toWarehouseId: warehouse.id, toLocationId: location.id,
    });

    reserveOrderStock("order-3", [{ productId: "product-1", title: "Product", quantity: 3 } as T_OrderItem]);
    replaceOrderStockReservation("order-3", [{ productId: "product-1", title: "Product", quantity: 5 } as T_OrderItem], "Manager");

    expect(getProductInventory("product-1")).toMatchObject({ physical: 10, reserved: 5, available: 5 });

    finalizeOrderStock("order-3", "sale", "Manager");
    finalizeOrderStock("order-3", "sale", "Manager");

    expect(getProductInventory("product-1")).toMatchObject({ physical: 5, reserved: 0, available: 5 });
  });

  it("keeps damaged returns in physical stock but out of available stock", async () => {
    const warehouse = await createTestWarehouse();
    const location = warehouse.locations[0];
    await recordInventoryMovement({
      type: "return", productId: "product-1", quantity: 2, condition: "damaged",
      reason: "Customer return with damaged packaging", createdBy: "Manager",
      toWarehouseId: warehouse.id, toLocationId: location.id,
    });
    await recordInventoryMovement({
      type: "receipt", productId: "product-1", quantity: 5, condition: "sellable",
      reason: "Delivery", createdBy: "Manager", toWarehouseId: warehouse.id, toLocationId: location.id,
    });
    await recordInventoryMovement({
      type: "damage", productId: "product-1", quantity: 1,
      reason: "Damaged during handling", createdBy: "Manager",
      fromWarehouseId: warehouse.id, fromLocationId: location.id,
    });

    expect(getProductInventory("product-1")).toMatchObject({ physical: 7, reserved: 0, available: 4 });
    const balances = (await getWarehouseState()).balances;
    expect(balances.find(({ condition }) => condition === "damaged")?.physical).toBe(3);
  });

  it("tracks consumables and writes fractional quantities off for a service", async () => {
    const warehouse = await createTestWarehouse();
    const location = warehouse.locations[0];
    const consumable = await createInventoryItem({
      name: "Hair dye",
      sku: "DYE-BLACK",
      unit: "ml",
      lowStockThreshold: 100,
    });

    await recordInventoryMovement({
      type: "receipt", itemType: "consumable", productId: consumable.id,
      quantity: 500, reason: "Supplier delivery", createdBy: "Manager",
      toWarehouseId: warehouse.id, toLocationId: location.id,
    });
    await recordInventoryMovement({
      type: "service_usage", itemType: "consumable", productId: consumable.id,
      quantity: 62.5, reason: "Hair coloring", reference: "appointment-1", createdBy: "Specialist",
      fromWarehouseId: warehouse.id, fromLocationId: location.id,
    });

    const state = await getWarehouseState();
    expect(state.inventoryItems[0]).toMatchObject({ name: "Hair dye", unit: "ml" });
    expect(state.balances[0].physical).toBe(437.5);
    expect(state.movements[0]).toMatchObject({ type: "service_usage", itemType: "consumable", reference: "appointment-1" });
  });

  it("consumes all service materials atomically and only once", async () => {
    const warehouse = await createTestWarehouse(); const location = warehouse.locations[0];
    await recordInventoryMovement({ type: "receipt", productId: "product-1", quantity: 5, reason: "Delivery", createdBy: "Manager", toWarehouseId: warehouse.id, toLocationId: location.id });
    const input = { appointmentId: "appointment-atomic", serviceTitle: "Repair", createdBy: "Specialist", materials: [{ itemType: "product" as const, productId: "product-1", warehouseId: warehouse.id, locationId: location.id, quantity: 2 }] };
    await consumeServiceMaterials(input); await consumeServiceMaterials(input);
    expect(getProductInventory("product-1")).toMatchObject({ physical: 3, available: 3 });
    expect((await getWarehouseState()).movements.filter((item) => item.reference === input.appointmentId)).toHaveLength(1);
    await expect(consumeServiceMaterials({ ...input, appointmentId: "appointment-failed", materials: [{ ...input.materials[0], quantity: 4 }] })).rejects.toMatchObject({ code: "INSUFFICIENT_STOCK" });
    expect(getProductInventory("product-1").physical).toBe(3);
  });

  it("reserves the selected product variant instead of base stock", async () => {
    const warehouse = await createTestWarehouse();
    const location = warehouse.locations[0];
    await recordInventoryMovement({
      type: "receipt", productId: "product-1", variantId: "large", quantity: 4,
      reason: "Variant delivery", createdBy: "Manager",
      toWarehouseId: warehouse.id, toLocationId: location.id,
    });

    reserveOrderStock("order-variant", [{ productId: "product-1", variantId: "large", title: "Large", quantity: 2 } as T_OrderItem]);

    expect(getProductInventory("product-1", "large")).toMatchObject({ physical: 4, reserved: 2, available: 2 });
    expect(getProductInventory("product-1")).toMatchObject({ physical: 0, reserved: 0, available: 0 });
  });
});
