export type T_WarehouseStatus = "active" | "inactive";
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
  | "damage";

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
  balances: T_InventoryBalance[];
  movements: T_InventoryMovement[];
};

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
  type: "receipt" | "write_off" | "transfer" | "adjustment" | "return" | "damage";
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
