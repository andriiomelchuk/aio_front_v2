import { ProductDetailLoader } from "@/components/Products";
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
  return <ProductDetailLoader slug={slug} />;
}
