import type { T_Product } from "@/entities/product/model/types";

export type T_ProductSectionProps = {
  product?: T_Product;
};

export type T_ProductMainSectionProps = T_ProductSectionProps & {
  isEditMode: boolean;
};
