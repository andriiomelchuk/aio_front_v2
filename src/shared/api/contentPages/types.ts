import { ApiError } from "@/shared/api/core";
import type {
  T_ContentPage,
  T_CreateContentPageDto,
  T_UpdateContentPageDto,
} from "@/entities/contentPage";

export type T_ContentPagesApiErrorCode =
  | "NOT_FOUND"
  | "DUPLICATE_SLUG"
  | "RESERVED_SLUG"
  | "INVALID_SLUG"
  | "INVALID_CONTENT"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export type T_ContentPagesApiContract = {
  getContentPages: () => Promise<T_ContentPage[]>;
  getContentPageById: (id: string) => Promise<T_ContentPage>;
  getContentPageBySlug: (slug: string) => Promise<T_ContentPage>;
  createContentPage: (input: T_CreateContentPageDto) => Promise<T_ContentPage>;
  updateContentPage: (input: T_UpdateContentPageDto) => Promise<T_ContentPage>;
  duplicateContentPage: (id: string) => Promise<T_ContentPage>;
  deleteContentPage: (id: string) => Promise<string>;
};

export class ContentPagesApiError extends ApiError<T_ContentPagesApiErrorCode> {
  constructor(
    public readonly code: T_ContentPagesApiErrorCode,
    message: string,
  ) {
    super(code, message);
    this.name = "ContentPagesApiError";
  }
}
