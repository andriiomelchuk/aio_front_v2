import type {
  T_CreateProductDto,
  T_Product,
  T_UpdateProductDto,
} from "@/entities/product/model/types";
import {
  ProductsApiError,
  type T_JsonPlaceholderProductsResponse,
} from "./types";

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

const assertUniqueSlug = (
  products: T_Product[],
  slug: string,
  ignoredProductId?: string,
) => {
  const normalizedSlug = normalizeSlug(slug);
  const duplicate = products.some(
    (product) =>
      product.id !== ignoredProductId &&
      normalizeSlug(product.slug) === normalizedSlug,
  );

  if (duplicate) {
    throw new ProductsApiError(
      "DUPLICATE_SLUG",
      `Product with slug "${normalizedSlug}" already exists`,
    );
  }

  return normalizedSlug;
};

const PRODUCTS_STORAGE_KEY = "admin-products-overrides";
const DELETED_PRODUCTS_STORAGE_KEY = "admin-products-deleted";

type T_ProductOverrides = Record<string, T_Product>;
export type T_BulkUpdateProductsDto = {
  ids: Array<string | number>;
  changes: Partial<Omit<T_Product, "id" | "createdAt">>;
};

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

const getDeletedProductIds = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(
      localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY) ?? "[]",
    ) as string[];
  } catch {
    return [];
  }
};

const saveStoredProductOverrides = (products: T_ProductOverrides) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

const saveDeletedProductIds = (ids: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(ids));
};

const deleteStoredProductOverride = (id: string) => {
  const overrides = getStoredProductOverrides();

  delete overrides[id];

  saveStoredProductOverrides(overrides);
};

const mergeProductsWithOverrides = (
  products: T_Product[],
  overrides: T_ProductOverrides,
  deletedProductIds: string[],
) => {
  const deletedProductIdsSet = new Set(deletedProductIds);
  const visibleProducts = products.filter(
    (product) => !deletedProductIdsSet.has(product.id),
  );
  const productIds = new Set(visibleProducts.map((product) => product.id));
  const updatedProducts = visibleProducts.map(
    (product) => overrides[product.id] ?? product,
  );
  const createdProducts = Object.values(overrides).filter(
    (product) =>
      !productIds.has(product.id) && !deletedProductIdsSet.has(product.id),
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

  const products = await getProducts();
  const slug = assertUniqueSlug(products, product.slug);

  const newProduct: T_Product = {
    id: createProductId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...product,
    slug,
  };

  const overrides = getStoredProductOverrides();
  const deletedProductIds = getDeletedProductIds();

  saveStoredProductOverrides({
    ...overrides,
    [newProduct.id]: newProduct,
  });
  saveDeletedProductIds(
    deletedProductIds.filter((productId) => productId !== newProduct.id),
  );

  return newProduct;
};

export const updateProduct = async (
  product: T_UpdateProductDto
): Promise<T_Product> => {
  const products = await getProducts();
  const currentProduct = products.find((prod) => prod.id === product.id);

  if (!currentProduct) {
    throw new ProductsApiError("NOT_FOUND", "Product not found");
  }

  const slug = product.slug === undefined
    ? currentProduct.slug
    : assertUniqueSlug(products, product.slug, product.id);

  const updatedProduct = {
    ...currentProduct,
    ...product,
    slug,
    updatedAt: new Date().toISOString(),
  };

  const overrides = getStoredProductOverrides();

  saveStoredProductOverrides({
    ...overrides,
    [product.id]: updatedProduct,
  });

  return updatedProduct;
};

export const deleteProduct = async (id: string | number) => {
  const productId = String(id);
  const deletedProductIds = getDeletedProductIds();

  deleteStoredProductOverride(productId);
  saveDeletedProductIds([...new Set([...deletedProductIds, productId])]);

  return productId;
};

export const bulkUpdateProducts = async ({
  ids,
  changes,
}: T_BulkUpdateProductsDto): Promise<T_Product[]> => {
  const productIds = ids.map(String);
  const products = await getProducts();
  const updatedProducts = products
    .filter((product) => productIds.includes(product.id))
    .map((product) => ({
      ...product,
      ...changes,
      id: product.id,
      createdAt: product.createdAt,
      updatedAt: new Date().toISOString(),
    }));

  const overrides = getStoredProductOverrides();
  const nextOverrides = updatedProducts.reduce(
    (acc, product) => ({
      ...acc,
      [product.id]: product,
    }),
    overrides,
  );

  saveStoredProductOverrides(nextOverrides);

  return updatedProducts;
};

export const getProducts = async (): Promise<T_Product[]> => {
  const overrides = getStoredProductOverrides();
  const deletedProductIds = getDeletedProductIds();
  let allProducts: T_Product[] = [];

  try {
    const response = await fetch("https://dummyjson.com/products?limit=0");

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
  } catch (error) {
    if (Object.keys(overrides).length > 0) {
      return mergeProductsWithOverrides([], overrides, deletedProductIds);
    }

    throw error;
  }

  if (typeof window === "undefined") {
    return allProducts;
  }

  return mergeProductsWithOverrides(allProducts, overrides, deletedProductIds);
};

export const getProductById = async (id: string): Promise<T_Product> => {
  const products = await getProducts();

  const product = products.find((prod) => prod.id === id);

  if (!product) {
    throw new ProductsApiError("NOT_FOUND", "Product not found");
  }

  return product;
};
