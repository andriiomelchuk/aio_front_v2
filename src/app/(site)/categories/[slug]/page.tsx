import { CategoryProducts } from "@/components/Categories";
import { getCategories } from "@/shared/api/categories";
import { getProducts } from "@/shared/api/products";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AssignedMenuLayout } from "@/components/Menu";
import type { Metadata } from "next";

type T_CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const generateMetadata = async ({ params }: T_CategoryPageProps): Promise<Metadata> => {
  const { slug } = await params;

  return {
    alternates: { canonical: `/categories/${slug.toLowerCase()}` },
  };
};

export default async function CategoryPage({ params }: T_CategoryPageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  const category = categories.find(
    (item) => item.slug.toLowerCase() === normalizedSlug,
  );

  if (!category || category.status !== "active") {
    notFound();
  }

  return (
    <AssignedMenuLayout target={{ type: "category", entityId: category.id }}><Suspense fallback={null}>
      <CategoryProducts
        category={category}
        products={products}
        categories={categories}
      />
    </Suspense></AssignedMenuLayout>
  );
}
