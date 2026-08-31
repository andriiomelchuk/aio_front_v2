import type {
  T_CreateProductDto,
  T_Product,
  T_UpdateProductDto,
} from "@/entities/product/model/types";
import type { T_JsonPlaceholderProductsResponse } from "./types";

const PRODUCTS_STORAGE_KEY = "admin-products-overrides";

type T_ProductOverrides = Record<string, T_Product>;

const getStoredProductOverrides = (): T_ProductOverrides => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(
      localStorage.getItem(PRODUCTS_STORAGE_KEY) ?? "{}"
    ) as T_ProductOverrides;
  } catch {
    return {};
  }
};

const saveStoredProductOverrides = (products: T_ProductOverrides) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

const mergeProductsWithOverrides = (
  products: T_Product[],
  overrides: T_ProductOverrides
) => {
  const productIds = new Set(products.map((product) => product.id));
  const updatedProducts = products.map(
    (product) => overrides[product.id] ?? product
  );
  const createdProducts = Object.values(overrides).filter(
    (product) => !productIds.has(product.id)
  );

  return [...createdProducts, ...updatedProducts];
};

const createProductId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}`;
};

export const createProduct = async (
  product: T_CreateProductDto
): Promise<T_Product> => {
  console.log("Create product request:", product);

  const newProduct: T_Product = {
    id: createProductId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...product,
  };

  const overrides = getStoredProductOverrides();

  saveStoredProductOverrides({
    ...overrides,
    [newProduct.id]: newProduct,
  });

  return newProduct;
};

export const updateProduct = async (
  product: T_UpdateProductDto
): Promise<T_Product> => {
  const products = await getProducts();
  const currentProduct = products.find((prod) => prod.id === product.id);

  if (!currentProduct) {
    throw new Error("Product not found");
  }

  const updatedProduct = {
    ...currentProduct,
    ...product,
    updatedAt: new Date().toISOString(),
  };

  const overrides = getStoredProductOverrides();

  saveStoredProductOverrides({
    ...overrides,
    [product.id]: updatedProduct,
  });

  return updatedProduct;
};

export const getProducts = async (): Promise<T_Product[]> => {
  const overrides = getStoredProductOverrides();
  let allProducts: T_Product[] = [];

  try {
    const response = await fetch("https://dummyjson.com/products");

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data: T_JsonPlaceholderProductsResponse = await response.json();

    allProducts = data.products.map((product) => ({
      id: String(product.id),
      title: product.title,
      slug: product.title.toLowerCase().replaceAll(" ", "-"),
      sku: product.sku,

      shortDescription: product.description,
      description: product.description,

      price: product.price,
      oldPrice: undefined,
      discountPercentage: product.discountPercentage,
      currency: "USD",

      stockQuantity: product.stock,
      stockStatus:
        product.availabilityStatus === "In Stock"
          ? "in_stock"
          : product.availabilityStatus === "Low Stock"
            ? "low_stock"
            : "out_of_stock",

      brand: product.brand,
      categoryId: product.category,
      status: "active",

      thumbnail: product.thumbnail,
      images: product.images.map((image, index) => ({
        id: `${product.id}-${index}`,
        url: image,
        alt: product.title,
        isMain: image === product.thumbnail,
      })),

      attributes: [
        { name: "Rating", value: String(product.rating) },
        { name: "Warranty", value: product.warrantyInformation },
        { name: "Shipping", value: product.shippingInformation },
      ],

      seo: {
        title: product.title,
        description: product.description,
        keywords: product.tags,
      },

      shipping: {
        weight: product.weight,
        width: product.dimensions.width,
        height: product.dimensions.height,
        depth: product.dimensions.depth,
      },

      createdAt: product.meta.createdAt,
      updatedAt: product.meta.updatedAt,
    }));
  } catch {
    allProducts = [];
  }

  if (typeof window === "undefined") {
    return allProducts;
  }

  return mergeProductsWithOverrides(allProducts, overrides);
};

export const getProductById = async (id: string): Promise<T_Product> => {
  const products = await getProducts();

  const product = products.find((prod) => prod.id === id);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};
