import { ApiError } from "@/shared/api/core";
import type { T_Categories, T_CreateCategoryDto, T_UpdateCategoryDto } from "@/entities/categories";

export type T_CategoriesApiErrorCode = "NOT_FOUND" | "DUPLICATE_SLUG" | "FETCH_FAILED";

export type T_CategoriesApiContract = {
  getCategories: () => Promise<T_Categories[]>;
  createCategory: (input: T_CreateCategoryDto) => Promise<T_Categories>;
  updateCategory: (input: T_UpdateCategoryDto) => Promise<T_Categories>;
};

export class CategoriesApiError extends ApiError<T_CategoriesApiErrorCode> {
  constructor(
    public readonly code: T_CategoriesApiErrorCode,
    message: string,
  ) {
    super(code, message);
    this.name = "CategoriesApiError";
  }
}
