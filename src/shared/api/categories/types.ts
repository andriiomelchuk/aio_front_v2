export type T_JsonPlaceholderCategory = {
  slug: string;
  name: string;
  url: string;
};

export type T_CategoriesApiErrorCode = "NOT_FOUND" | "DUPLICATE_SLUG";

export class CategoriesApiError extends Error {
  constructor(
    public readonly code: T_CategoriesApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CategoriesApiError";
  }
}
