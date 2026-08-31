"use client";

import { useRouter } from "next/navigation";
import { createProduct } from "@/shared/api/products";
import { ProductForm } from "../ProductForm";

export const CreateProductPageContent = () => {
  const router = useRouter();

  return (
    <ProductForm
      mode="create"
      onCancel={() => router.push("/admin/products")}
      onCreate={async (product) => {
        await createProduct(product);
        router.push("/admin/products");
      }}
    />
  );
};