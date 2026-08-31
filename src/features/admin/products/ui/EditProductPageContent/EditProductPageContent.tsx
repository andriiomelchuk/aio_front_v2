"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { T_Product } from "@/entities/product/model/types";
import { ProductForm } from "../ProductForm";
import { getProductById, updateProduct } from "@/shared/api/products";

export const EditProductPageContent = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<T_Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const loadedProduct = await getProductById(params.id);
        setProduct(loadedProduct);
      } catch {
        setError("Product not found");
      }
    };

    loadProduct();
  }, [params.id]);

  if (error) {
    return <div className="p-4 text-danger">{error}</div>;
  }

  if (!product) {
    return <div className="p-4 text-muted">Loading...</div>;
  }

  return (
    <ProductForm
      mode="edit"
      product={product}
      onCancel={() => router.push("/admin/products")}
      onUpdate={async (updatedProduct) => {
        await updateProduct(updatedProduct);
        router.push("/admin/products");
      }}
    />
  );
};
