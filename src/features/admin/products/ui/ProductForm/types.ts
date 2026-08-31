import type {
  T_CreateProductDto,
  T_Product,
  T_UpdateProductDto,
} from "@/entities/product/model/types";

export type T_ProductForm = {
  mode: "create" | "edit";
  product?: T_Product;
  onCancel?: () => void;
  onCreate?: (product: T_CreateProductDto) => void;
  onUpdate?: (product: T_UpdateProductDto) => void;
};
