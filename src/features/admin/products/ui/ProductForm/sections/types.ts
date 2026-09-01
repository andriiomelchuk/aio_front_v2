import type { T_Product } from "@/entities/product/model/types";
import type { T_ProductFormErrors } from "../types";
import type { T_ProductFormSectionProps } from "../ProductFormSection";

export type T_ProductSectionProps = {
  product?: T_Product;
  errors?: T_ProductFormErrors;
  sectionControl?: Pick<
    T_ProductFormSectionProps,
    "isOpen" | "onOpenChange"
  >;
};

export type T_ProductMainSectionProps = T_ProductSectionProps & {
  isEditMode: boolean;
};
