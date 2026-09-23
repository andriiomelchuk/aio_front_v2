import type { T_CreateProductDto, T_Product, T_UpdateProductDto } from "@/entities/product";
import { ApiError } from "@/shared/api/core";

export type T_BulkUpdateProductsDto = {
  ids: Array<string | number>;
  changes: Partial<Omit<T_Product, "id" | "createdAt">>;
};

export type T_ProductsTransferDocument = {
  schemaVersion: 2;
  exportedAt: string;
  products: T_Product[];
};

export type T_ProductsApiContract = {
  getProducts: () => Promise<T_Product[]>;
  getProductById: (id: string) => Promise<T_Product>;
  createProduct: (input: T_CreateProductDto) => Promise<T_Product>;
  updateProduct: (input: T_UpdateProductDto) => Promise<T_Product>;
  deleteProduct: (id: string | number) => Promise<string>;
  bulkUpdateProducts: (input: T_BulkUpdateProductsDto) => Promise<T_Product[]>;
  exportProducts: () => Promise<T_ProductsTransferDocument>;
  importProducts: (document: T_ProductsTransferDocument) => Promise<T_Product[]>;
};

export type T_ProductsApiErrorCode = "NOT_FOUND" | "DUPLICATE_SLUG" | "FETCH_FAILED";

export class ProductsApiError extends ApiError<T_ProductsApiErrorCode> {
  constructor(
    public readonly code: T_ProductsApiErrorCode,
    message: string,
  ) {
    super(code, message);
    this.name = "ProductsApiError";
  }
}
