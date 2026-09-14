import type { T_Product } from "@/entities/product/model/types";
import type { T_Categories } from "@/entities/categories/model/types";
import type {
  T_CatalogParams,
  T_CatalogSort,
  T_CatalogStock,
} from "@/features/catalog";

export type T_ProductCardProps = {
  product: T_Product;
  onAddToCart?: (product: T_Product) => void;
  onAddToWishlist?: (product: T_Product) => void;
  onAddToCompare?: (product: T_Product) => void;
};

export type T_ProductDetailProps = {
  product: T_Product;
};

export type T_ProductCatalogProps = {
  products: T_Product[];
  categories: T_Categories[];
  fixedCategory?: string;
  categoryTitle?: string;
};

export type T_CatalogFiltersProps = {
  params: T_CatalogParams;
  categories: T_Categories[];
  fixedCategory?: string;
  onUpdate: (changes: Partial<T_CatalogParams>) => void;
  onReset: () => void;
};

export type T_CatalogFilterChange =
  | { stock: T_CatalogStock }
  | { sort: T_CatalogSort };

