"use client";

import { ProductCatalog } from "@/components/Products";
import type { T_CategoryProductsProps } from "./types";
import { useLocalizedCategories, useLocalizedCategory } from "@/features/catalog";

export const CategoryProducts = ({
  category,
  products,
  categories,
}: T_CategoryProductsProps) => {
  const localizedCategory = useLocalizedCategory(category);
  const localizedCategories = useLocalizedCategories(categories);

  return (
    <ProductCatalog
      products={products}
      categories={localizedCategories}
      fixedCategory={category.slug}
      categoryTitle={localizedCategory.name}
    />
  );
};
