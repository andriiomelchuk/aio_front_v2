import { ProductDetail } from "@/components/Products";
import { getProducts } from "@/shared/api/products";
import { notFound } from "next/navigation";
import { AssignedMenuLayout } from "@/components/Menu";
import type { Metadata } from "next";

type T_ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const generateMetadata = async ({ params }: T_ProductPageProps): Promise<Metadata> => {
  const { slug } = await params;

  return {
    alternates: { canonical: `/products/${slug.toLowerCase()}` },
  };
};

export default async function ProductPage({ params }: T_ProductPageProps) {
  const { slug } = await params;
  const products = await getProducts();
  const normalizedSlug = slug.toLowerCase();
  const product = products.find((item) => item.slug.toLowerCase() === normalizedSlug);

  if (!product) {
    notFound();
  }

  return <AssignedMenuLayout target={{ type: "product", entityId: product.id }}><ProductDetail product={product} /></AssignedMenuLayout>;
}
