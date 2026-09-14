import { getProducts } from "@/shared/api/products";
import { getCategories } from "@/shared/api/categories";
import { ProductCatalog } from "./ProductCatalog";

export const Products = async () => {

    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    return <ProductCatalog products={products} categories={categories} />;
}
