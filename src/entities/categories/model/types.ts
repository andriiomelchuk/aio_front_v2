import type { T_Locale } from "@/shared/i18n";

export type T_CategoriesStatus = "active" | "inactive";

export type T_CategoryTranslation = {
    name: string;
    description: string;
};

export type T_Categories = {
    id: string,
    slug: string,
    name: string,
    description?: string,
    status: T_CategoriesStatus,
    defaultLocale?: T_Locale,
    translations?: Partial<Record<T_Locale, T_CategoryTranslation>>,
}

export type T_CreateCategoryDto = Omit<T_Categories, "id">;

export type T_UpdateCategoryDto = T_Categories;
