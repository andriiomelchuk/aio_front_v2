import { Categories } from "@/components/Categories";
import { getCategories } from "@/shared/api/categories";
import { getProducts } from "@/shared/api/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore the AIO product catalog by category.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return <Categories categories={categories} products={products} />;
}
