import type {
  T_CreateProductDto,
  T_Product,
  T_UpdateProductDto,
} from "@/entities/product/model/types";
import type { T_InventoryCondition } from "@/entities/warehouse";

export type T_InitialStockPlacement = {
  warehouseId: string;
  locationId: string;
  variantId?: string;
  quantity: number;
  condition: T_InventoryCondition;
};

export type T_ProductForm = {
  mode: "create" | "edit";
  product?: T_Product;
  onCancel?: () => void;
  onCreate?: (product: T_CreateProductDto, initialPlacement?: T_InitialStockPlacement) => void | Promise<void>;
  onUpdate?: (product: T_UpdateProductDto) => void | Promise<void>;
};

export type T_ProductFormErrors = Partial<
  Record<
    | keyof T_CreateProductDto
    | "variantTitle"
    | "variantSku"
    | "variantPrice"
    | "variantStockQuantity",
    string
  >
>;
