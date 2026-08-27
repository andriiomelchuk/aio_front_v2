import { T_Categories, T_CategoriesStatus } from "@/entities/categories/model/types";


export type T_EditCategoryData = {
    id: string,
    name: string;
    slug: string,
    status: T_CategoriesStatus;
};

export type T_EditCategoryFormProps = {
    category: T_Categories;
    onCancel: () => void;
    onUpdate: (category: T_Categories) => void;
};