export type T_CategoriesStatus = "active" | "inactive";

export type T_Categories = {
    id: string,
    slug: string,
    name: string,
    status: T_CategoriesStatus,
}

export type T_CreateCategoryDto = Omit<T_Categories, "id">;

export type T_UpdateCategoryDto = T_Categories;
