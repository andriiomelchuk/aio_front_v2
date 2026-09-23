export type T_WarehouseStatus = "active" | "inactive";
export type T_InventoryItemType = "product" | "consumable";
export type T_InventoryUnit = "piece" | "ml" | "l" | "g" | "kg";
export type T_InventoryItemStatus = "active" | "inactive";
export type T_InventoryCondition = "sellable" | "quarantine" | "damaged";
export type T_InventoryMovementType =
  | "receipt"
  | "write_off"
  | "transfer"
  | "adjustment"
  | "reservation"
  | "release"
  | "sale"
  | "return"
  | "damage"
  | "service_usage";

export type T_InventoryItem = {
  id: string;
  type: "consumable";
  name: string;
  sku: string;
  unit: T_InventoryUnit;
  lowStockThreshold: number;
  status: T_InventoryItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type T_WarehouseLocation = {
  id: string;
  name: string;
  code: string;
};

export type T_Warehouse = {
  id: string;
  name: string;
  code: string;
  address: string;
  status: T_WarehouseStatus;
  locations: T_WarehouseLocation[];
  createdAt: string;
  updatedAt: string;
};

export type T_InventoryBalance = {
  itemType?: T_InventoryItemType;
  productId: string;
  variantId?: string;
  warehouseId: string;
  locationId: string;
  condition: T_InventoryCondition;
  physical: number;
  reserved: number;
  updatedAt: string;
};

export type T_InventoryMovement = {
  id: string;
  type: T_InventoryMovementType;
  itemType?: T_InventoryItemType;
  productId: string;
  variantId?: string;
  fromWarehouseId?: string;
  fromLocationId?: string;
  toWarehouseId?: string;
  toLocationId?: string;
  quantity: number;
  condition: T_InventoryCondition;
  reason: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
};

export type T_WarehouseState = {
  warehouses: T_Warehouse[];
  inventoryItems: T_InventoryItem[];
  balances: T_InventoryBalance[];
  movements: T_InventoryMovement[];
};

export type T_CreateInventoryItemDto = Pick<
  T_InventoryItem,
  "name" | "sku" | "unit" | "lowStockThreshold"
>;

export type T_CreateWarehouseDto = Pick<T_Warehouse, "name" | "code" | "address"> & {
  locationName: string;
  locationCode: string;
};

export type T_CreateWarehouseLocationDto = {
  warehouseId: string;
  name: string;
  code: string;
};

export type T_RecordInventoryMovementDto = {
  type: "receipt" | "write_off" | "transfer" | "adjustment" | "return" | "damage" | "service_usage";
  itemType?: T_InventoryItemType;
  productId: string;
  variantId?: string;
  fromWarehouseId?: string;
  fromLocationId?: string;
  toWarehouseId?: string;
  toLocationId?: string;
  quantity: number;
  adjustmentDirection?: "increase" | "decrease";
  condition?: T_InventoryCondition;
  reason: string;
  reference?: string;
  createdBy: string;
};

export type T_ProductInventory = {
  isManaged: boolean;
  physical: number;
  reserved: number;
  available: number;
};
