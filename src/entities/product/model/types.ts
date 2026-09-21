import type { T_Locale } from "@/shared/i18n/types";

export type T_ProductStatus = "draft" | "active" | "archived";

export type T_ProductStockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock";

export type T_ProductCurrency = "USD" | "EUR" | "UAH" | "GBP";

export type T_ProductAttribute = {
  id?: string;
  name: string;
  value: string;
};

export type T_ProductVariant = {
  id: string;
  sku: string;
  title: string;
  price: number;
  oldPrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  stockStatus: T_ProductStockStatus;
  attributes: T_ProductAttribute[];
};

export type T_ProductSeo = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type T_ProductAttributeTranslation = { sourceId?: string; name: string; value: string };
export type T_ProductVariantTranslation = {
  title: string;
  attributes: T_ProductAttributeTranslation[];
};
export type T_ProductTranslation = {
  title: string;
  shortDescription: string;
  description: string;
  seo: { title: string; description: string; keywords: string[] };
  attributes: T_ProductAttributeTranslation[];
  variants: Record<string, T_ProductVariantTranslation>;
  imageAlts: Record<string, string>;
};

export type T_ProductShipping = {
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
};

export type T_ProductImage = {
  id: string;
  url: string;
  alt?: string;
  isMain?: boolean;
  sortOrder?: number;
};

export type T_Product = {
  id: string;
  title: string;
  slug: string;
  sku: string;

  shortDescription?: string;
  description: string;

  price: number;
  oldPrice?: number;
  discountPercentage?: number;
  currency: T_ProductCurrency;

  stockQuantity: number;
  stockStatus: T_ProductStockStatus;

  brand?: string;
  categoryId: string;
  status: T_ProductStatus;

  thumbnail: string;
  images: T_ProductImage[];

  attributes: T_ProductAttribute[];
  variants?: T_ProductVariant[];

  seo?: T_ProductSeo;
  shipping?: T_ProductShipping;

  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  defaultLocale?: T_Locale;
  translations?: Partial<Record<T_Locale, T_ProductTranslation>>;
};

export type T_CreateProductDto = Omit<
  T_Product,
  "id" | "createdAt" | "updatedAt"
>;

export type T_UpdateProductDto = Partial<
  Omit<T_Product, "id" | "createdAt" | "updatedAt">
> & {
  id: string;
};
