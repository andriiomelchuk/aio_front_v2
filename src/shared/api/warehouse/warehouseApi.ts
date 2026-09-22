import type {
  T_CreateWarehouseDto,
  T_CreateWarehouseLocationDto,
  T_CreateInventoryItemDto,
  T_InventoryBalance,
  T_InventoryCondition,
  T_InventoryMovement,
  T_ProductInventory,
  T_RecordInventoryMovementDto,
  T_Warehouse,
  T_WarehouseState,
} from "@/entities/warehouse";
import type { T_OrderItem } from "@/entities/order";
import { WarehouseApiError } from "./types";
import { readSiteSettings } from "@/shared/api/siteSettings";

const STORAGE_KEY = "aio-warehouse-state";
const VERSION_KEY = "aio-warehouse-version";
const BACKUP_KEY = "aio-warehouse-migration-backup-v2";
const SCHEMA_VERSION = 3;
export const WAREHOUSE_CHANGE_EVENT = "aio-warehouse-change";

const emptyState: T_WarehouseState = { warehouses: [], inventoryItems: [], balances: [], movements: [] };
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const createId = () => crypto.randomUUID();
const normalizeCode = (value: string) => value.trim().toUpperCase();
const getStorage = () => typeof window === "undefined" ? undefined : window.localStorage;

const normalizeState = (value: unknown): T_WarehouseState => {
  if (!isRecord(value)) return emptyState;
  return {
    warehouses: Array.isArray(value.warehouses) ? value.warehouses as T_Warehouse[] : [],
    inventoryItems: Array.isArray(value.inventoryItems) ? value.inventoryItems as T_WarehouseState["inventoryItems"] : [],
    balances: Array.isArray(value.balances) ? (value.balances as T_InventoryBalance[]).map((balance) => ({ ...balance, itemType: balance.itemType ?? "product", condition: balance.condition ?? "sellable" })) : [],
    movements: Array.isArray(value.movements) ? (value.movements as T_InventoryMovement[]).map((movement) => ({ ...movement, itemType: movement.itemType ?? "product", condition: movement.condition ?? "sellable" })) : [],
  };
};

export const readWarehouseState = (): T_WarehouseState => {
  const storage = getStorage();
  if (!storage) return emptyState;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return emptyState;
  try {
    const state = normalizeState(JSON.parse(raw) as unknown);
    if (storage.getItem(VERSION_KEY) !== String(SCHEMA_VERSION)) {
      if (!storage.getItem(BACKUP_KEY)) storage.setItem(BACKUP_KEY, raw);
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    storage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    return state;
  } catch {
    if (!storage.getItem(BACKUP_KEY)) storage.setItem(BACKUP_KEY, raw);
    return emptyState;
  }
};

const persist = (state: T_WarehouseState) => {
  const storage = getStorage();
  if (!storage) throw new WarehouseApiError("STORAGE_WRITE_FAILED", "Warehouse storage is unavailable");
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    storage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    window.dispatchEvent(new Event(WAREHOUSE_CHANGE_EVENT));
  } catch {
    throw new WarehouseApiError("STORAGE_WRITE_FAILED", "Could not save warehouse state");
  }
};

const balanceMatches = (
  balance: T_InventoryBalance,
  productId: string,
  warehouseId: string,
  locationId: string,
  variantId?: string,
  condition: T_InventoryCondition = "sellable",
  itemType: T_InventoryBalance["itemType"] = "product",
) => (balance.itemType ?? "product") === itemType && balance.productId === productId && balance.variantId === variantId && balance.warehouseId === warehouseId && balance.locationId === locationId && balance.condition === condition;

const getOrCreateBalance = (
  state: T_WarehouseState,
  productId: string,
  warehouseId: string,
  locationId: string,
  variantId?: string,
  condition: T_InventoryCondition = "sellable",
  itemType: T_InventoryBalance["itemType"] = "product",
) => {
  let balance = state.balances.find((item) => balanceMatches(item, productId, warehouseId, locationId, variantId, condition, itemType));
  if (!balance) {
    balance = { itemType, productId, variantId, warehouseId, locationId, condition, physical: 0, reserved: 0, updatedAt: new Date().toISOString() };
    state.balances.push(balance);
  }
  return balance;
};

const assertLocation = (state: T_WarehouseState, warehouseId?: string, locationId?: string) => {
  const warehouse = state.warehouses.find((item) => item.id === warehouseId && item.status === "active");
  if (!warehouse || !warehouse.locations.some((location) => location.id === locationId)) {
    throw new WarehouseApiError("NOT_FOUND", "Warehouse location was not found");
  }
};

export const getWarehouseState = async () => readWarehouseState();

export const createInventoryItem = async (input: T_CreateInventoryItemDto) => {
  const state = readWarehouseState();
  const sku = normalizeCode(input.sku);
  const lowStockThreshold = Number(input.lowStockThreshold);
  if (!input.name.trim() || !sku || !Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
    throw new WarehouseApiError("INVALID_INPUT", "Name, SKU and a valid low-stock threshold are required");
  }
  if (state.inventoryItems.some((item) => item.sku === sku)) {
    throw new WarehouseApiError("DUPLICATE_CODE", "Inventory item SKU already exists");
  }
  const timestamp = new Date().toISOString();
  const item: T_WarehouseState["inventoryItems"][number] = {
    id: createId(), type: "consumable", name: input.name.trim(), sku,
    unit: input.unit, lowStockThreshold, status: "active",
    createdAt: timestamp, updatedAt: timestamp,
  };
  state.inventoryItems.push(item);
  persist(state);
  return item;
};

export const setInventoryItemStatus = async (itemId: string, status: "active" | "inactive") => {
  const state = readWarehouseState();
  const item = state.inventoryItems.find((entry) => entry.id === itemId);
  if (!item) throw new WarehouseApiError("NOT_FOUND", "Inventory item was not found");
  item.status = status;
  item.updatedAt = new Date().toISOString();
  persist(state);
  return item;
};

export const seedWarehouseDemoData = async () => {
  const currentState = readWarehouseState();
  if (currentState.warehouses.length || currentState.balances.length || currentState.movements.length) {
    return currentState;
  }

  const createdAt = new Date().toISOString();
  const mainWarehouse: T_Warehouse = {
    id: "warehouse-demo-main",
    name: "Central warehouse",
    code: "CENTRAL",
    address: "Kyiv, Industrialna Street 12",
    status: "active",
    locations: [
      { id: "location-demo-main-a", name: "Main shelf A", code: "A-01" },
      { id: "location-demo-quarantine", name: "Returns and quarantine", code: "Q-01" },
    ],
    createdAt,
    updatedAt: createdAt,
  };
  const reserveWarehouse: T_Warehouse = {
    id: "warehouse-demo-reserve",
    name: "Reserve warehouse",
    code: "RESERVE",
    address: "Lviv, Horodotska Street 44",
    status: "active",
    locations: [{ id: "location-demo-reserve-a", name: "Reserve zone", code: "R-01" }],
    createdAt,
    updatedAt: createdAt,
  };
  const balances: T_InventoryBalance[] = [
    { productId: "1", warehouseId: mainWarehouse.id, locationId: "location-demo-main-a", condition: "sellable", physical: 28, reserved: 3, updatedAt: createdAt },
    { productId: "2", warehouseId: mainWarehouse.id, locationId: "location-demo-main-a", condition: "sellable", physical: 7, reserved: 1, updatedAt: createdAt },
    { productId: "3", warehouseId: reserveWarehouse.id, locationId: "location-demo-reserve-a", condition: "sellable", physical: 15, reserved: 0, updatedAt: createdAt },
    { productId: "1", warehouseId: mainWarehouse.id, locationId: "location-demo-quarantine", condition: "quarantine", physical: 2, reserved: 0, updatedAt: createdAt },
    { productId: "4", warehouseId: mainWarehouse.id, locationId: "location-demo-quarantine", condition: "damaged", physical: 3, reserved: 0, updatedAt: createdAt },
    { productId: "5", warehouseId: reserveWarehouse.id, locationId: "location-demo-reserve-a", condition: "sellable", physical: 4, reserved: 0, updatedAt: createdAt },
  ];
  const movement = (
    id: string,
    type: T_InventoryMovement["type"],
    productId: string,
    quantity: number,
    condition: T_InventoryCondition,
    reason: string,
    warehouseId: string,
    locationId: string,
    createdBy: string,
  ): T_InventoryMovement => ({
    id, type, productId, quantity, condition, reason, createdBy, createdAt,
    ...(type === "receipt" || type === "return"
      ? { toWarehouseId: warehouseId, toLocationId: locationId }
      : { fromWarehouseId: warehouseId, fromLocationId: locationId }),
  });
  const movements: T_InventoryMovement[] = [
    movement("movement-demo-1", "return", "1", 2, "quarantine", "Customer return pending inspection", mainWarehouse.id, "location-demo-quarantine", "AIO Manager"),
    movement("movement-demo-2", "damage", "4", 3, "damaged", "Packaging damaged during delivery", mainWarehouse.id, "location-demo-quarantine", "AIO Manager"),
    movement("movement-demo-3", "reservation", "1", 3, "sellable", "Order reservation", mainWarehouse.id, "location-demo-main-a", "Checkout"),
    movement("movement-demo-4", "receipt", "3", 15, "sellable", "Supplier delivery", reserveWarehouse.id, "location-demo-reserve-a", "AIO Manager"),
    movement("movement-demo-5", "receipt", "2", 8, "sellable", "Initial stock receipt", mainWarehouse.id, "location-demo-main-a", "AIO Manager"),
  ];
  const demoState = { warehouses: [mainWarehouse, reserveWarehouse], inventoryItems: [], balances, movements };
  persist(demoState);
  return demoState;
};

export const createWarehouse = async (input: T_CreateWarehouseDto): Promise<T_Warehouse> => {
  const state = readWarehouseState();
  const code = normalizeCode(input.code);
  const locationCode = normalizeCode(input.locationCode);
  if (!input.name.trim() || !code || !input.locationName.trim() || !locationCode) {
    throw new WarehouseApiError("INVALID_INPUT", "Warehouse and location names and codes are required");
  }
  if (state.warehouses.some((warehouse) => warehouse.code === code)) {
    throw new WarehouseApiError("DUPLICATE_CODE", "Warehouse code already exists");
  }
  const timestamp = new Date().toISOString();
  const warehouse: T_Warehouse = {
    id: createId(), name: input.name.trim(), code, address: input.address.trim(), status: "active",
    locations: [{ id: createId(), name: input.locationName.trim(), code: locationCode }],
    createdAt: timestamp, updatedAt: timestamp,
  };
  persist({ ...state, warehouses: [...state.warehouses, warehouse] });
  return warehouse;
};

export const setWarehouseStatus = async (warehouseId: string, status: T_Warehouse["status"]) => {
  const state = readWarehouseState();
  const warehouse = state.warehouses.find((item) => item.id === warehouseId);
  if (!warehouse) throw new WarehouseApiError("NOT_FOUND", "Warehouse was not found");
  warehouse.status = status;
  warehouse.updatedAt = new Date().toISOString();
  persist(state);
  return warehouse;
};

export const addWarehouseLocation = async (input: T_CreateWarehouseLocationDto) => {
  const state = readWarehouseState();
  const warehouse = state.warehouses.find((item) => item.id === input.warehouseId);
  const code = normalizeCode(input.code);
  if (!warehouse) throw new WarehouseApiError("NOT_FOUND", "Warehouse was not found");
  if (!input.name.trim() || !code) throw new WarehouseApiError("INVALID_INPUT", "Location name and code are required");
  if (warehouse.locations.some((location) => location.code === code)) {
    throw new WarehouseApiError("DUPLICATE_CODE", "Location code already exists in this warehouse");
  }
  const location = { id: createId(), name: input.name.trim(), code };
  warehouse.locations.push(location);
  warehouse.updatedAt = new Date().toISOString();
  persist(state);
  return location;
};

export const recordInventoryMovement = async (input: T_RecordInventoryMovementDto) => {
  const state = readWarehouseState();
  const quantity = Math.abs(input.quantity);
  if (!input.productId || !Number.isFinite(quantity) || quantity <= 0 || !input.reason.trim()) {
    throw new WarehouseApiError("INVALID_INPUT", "Product, positive quantity and reason are required");
  }
  const timestamp = new Date().toISOString();
  const condition = input.condition ?? "sellable";
  const itemType = input.itemType ?? "product";
  if (itemType === "consumable" && !state.inventoryItems.some((item) => item.id === input.productId && item.status === "active")) {
    throw new WarehouseApiError("NOT_FOUND", "Active inventory item was not found");
  }
  const sourceRequired = input.type === "write_off" || input.type === "transfer" || input.type === "damage" || input.type === "service_usage" || (input.type === "adjustment" && input.adjustmentDirection === "decrease");
  const destinationRequired = input.type === "receipt" || input.type === "return" || input.type === "transfer" || (input.type === "adjustment" && input.adjustmentDirection !== "decrease");
  if (sourceRequired) assertLocation(state, input.fromWarehouseId, input.fromLocationId);
  if (destinationRequired) assertLocation(state, input.toWarehouseId, input.toLocationId);
  if (input.type === "transfer" && input.fromLocationId === input.toLocationId) {
    throw new WarehouseApiError("INVALID_INPUT", "Transfer locations must be different");
  }
  if (sourceRequired) {
    const sourceCondition = input.type === "damage" ? "sellable" : condition;
    const source = getOrCreateBalance(state, input.productId, input.fromWarehouseId!, input.fromLocationId!, input.variantId, sourceCondition, itemType);
    if (source.physical - source.reserved < quantity) throw new WarehouseApiError("INSUFFICIENT_STOCK", "Available stock is insufficient");
    source.physical -= quantity;
    source.updatedAt = timestamp;
  }
  if (destinationRequired) {
    const destination = getOrCreateBalance(state, input.productId, input.toWarehouseId!, input.toLocationId!, input.variantId, condition, itemType);
    destination.physical += quantity;
    destination.updatedAt = timestamp;
  }
  if (input.type === "damage") {
    const damaged = getOrCreateBalance(state, input.productId, input.fromWarehouseId!, input.fromLocationId!, input.variantId, "damaged", itemType);
    damaged.physical += quantity;
    damaged.updatedAt = timestamp;
  }
  const movement: T_InventoryMovement = {
    id: createId(), type: input.type, itemType, productId: input.productId, variantId: input.variantId,
    fromWarehouseId: input.fromWarehouseId, fromLocationId: input.fromLocationId,
    toWarehouseId: input.toWarehouseId, toLocationId: input.toLocationId,
    quantity, condition: input.type === "damage" ? "damaged" : condition, reason: input.reason.trim(), reference: input.reference?.trim() || undefined,
    createdAt: timestamp, createdBy: input.createdBy.trim() || "System",
  };
  state.movements.unshift(movement);
  persist(state);
  return movement;
};

export const getProductInventory = (productId: string, variantId?: string): T_ProductInventory => {
  const balances = readWarehouseState().balances.filter((balance) => (balance.itemType ?? "product") === "product" && balance.productId === productId && balance.variantId === variantId);
  const physical = balances.reduce((sum, balance) => sum + balance.physical, 0);
  const reserved = balances.reduce((sum, balance) => sum + balance.reserved, 0);
  const available = balances.filter((balance) => balance.condition === "sellable").reduce((sum, balance) => sum + balance.physical - balance.reserved, 0);
  return { isManaged: balances.length > 0, physical, reserved, available };
};

export const reserveOrderStock = (orderId: string, items: T_OrderItem[], createdBy = "Checkout") => {
  const state = readWarehouseState();
  const allowBackorders = readSiteSettings().commerce.allowBackorders;
  if (state.movements.some((movement) => movement.type === "reservation" && movement.reference === orderId)) return;
  const timestamp = new Date().toISOString();
  for (const item of items) {
    const balances = state.balances.filter((balance) => (balance.itemType ?? "product") === "product" && balance.productId === item.productId && balance.variantId === item.variantId && balance.condition === "sellable" && balance.physical > balance.reserved);
    if (!balances.length) continue;
    const available = balances.reduce((sum, balance) => sum + balance.physical - balance.reserved, 0);
    if (available < item.quantity && !allowBackorders) throw new WarehouseApiError("INSUFFICIENT_STOCK", `Insufficient warehouse stock for ${item.title}`);
    let remaining = item.quantity;
    for (const balance of balances) {
      const allocation = Math.min(remaining, balance.physical - balance.reserved);
      if (!allocation) continue;
      balance.reserved += allocation; balance.updatedAt = timestamp; remaining -= allocation;
      state.movements.unshift({ id: createId(), type: "reservation", itemType: "product", productId: item.productId, variantId: item.variantId, fromWarehouseId: balance.warehouseId, fromLocationId: balance.locationId, quantity: allocation, condition: "sellable", reason: "Order reservation", reference: orderId, createdAt: timestamp, createdBy });
      if (!remaining) break;
    }
  }
  persist(state);
};

export const finalizeOrderStock = (orderId: string, mode: "sale" | "release", createdBy = "System") => {
  const state = readWarehouseState();
  const reservations = state.movements.filter((movement) => movement.type === "reservation" && movement.reference === orderId);
  const isAlreadyFinalized = state.movements.some(
    (movement) => (movement.type === "sale" || movement.type === "release") && movement.reference === orderId,
  );
  if (!reservations.length || isAlreadyFinalized) return;
  const timestamp = new Date().toISOString();
  for (const reservation of reservations) {
    const balance = state.balances.find((item) => balanceMatches(item, reservation.productId, reservation.fromWarehouseId!, reservation.fromLocationId!, reservation.variantId, "sellable"));
    if (!balance) continue;
    balance.reserved = Math.max(0, balance.reserved - reservation.quantity);
    if (mode === "sale") balance.physical = Math.max(0, balance.physical - reservation.quantity);
    balance.updatedAt = timestamp;
    state.movements.unshift({ ...reservation, id: createId(), type: mode, reason: mode === "sale" ? "Order completed" : "Order reservation released", createdAt: timestamp, createdBy });
  }
  persist(state);
};
