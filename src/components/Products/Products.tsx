import { getProducts } from "@/shared/api/products";
import { ProductCard } from "./ProductCard";

export const Products = async () => {

    const products = await getProducts();

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
    )
}
