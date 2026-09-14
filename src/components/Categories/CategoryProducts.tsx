import { ProductCatalog } from "@/components/Products";
import type { T_CategoryProductsProps } from "./types";

export const CategoryProducts = ({
  category,
  products,
  categories,
}: T_CategoryProductsProps) => {
  return (
    <ProductCatalog
      products={products}
      categories={categories}
      fixedCategory={category.slug}
      categoryTitle={category.name}
    />
  );
};
