import type { T_Categories } from "@/entities/categories/model/types";
import type { T_Product } from "@/entities/product/model/types";

export type T_CategoryCardProps = {
  category: T_Categories;
  productCount: number;
  coverImage?: string;
};

export type T_CategoriesProps = {
  categories: T_Categories[];
  products: T_Product[];
};

export type T_CategoryProductsProps = {
  category: T_Categories;
  products: T_Product[];
  categories: T_Categories[];
};
