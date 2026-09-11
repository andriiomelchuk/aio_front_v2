import { Categories } from "@/components/Categories";
import { getCategories } from "@/shared/api/categories";
import { getProducts } from "@/shared/api/products";

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return <Categories categories={categories} products={products} />;
}
