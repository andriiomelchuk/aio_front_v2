import { ProductDetail } from "@/components/Products";
import { getProducts } from "@/shared/api/products";
import { notFound } from "next/navigation";
import { AssignedMenuLayout } from "@/components/Menu";

type T_ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: T_ProductPageProps) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return <AssignedMenuLayout target={{ type: "product", entityId: product.id }}><ProductDetail product={product} /></AssignedMenuLayout>;
}
