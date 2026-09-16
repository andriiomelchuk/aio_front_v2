import { Products } from "@/components/Products";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse, filter, compare, and purchase products in the AIO catalog.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
    return (
        <Suspense fallback={null}>
          <Products />
        </Suspense>
    )
}
