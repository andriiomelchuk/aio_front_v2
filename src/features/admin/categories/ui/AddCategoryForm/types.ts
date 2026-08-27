import { T_Categories, T_CategoriesStatus } from "@/entities/categories/model/types";

export type T_CategoryData = {
    slug: string,
    name: string;
    status: T_CategoriesStatus;
};

export type T_AddCategoryFormProps = {
    onCancel: () => void;
    onCreate: (category: T_Categories) => void;
};
