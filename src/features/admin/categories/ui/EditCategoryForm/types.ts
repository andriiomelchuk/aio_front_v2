import type { T_Categories, T_CategoryTranslation, T_CategoriesStatus } from "@/entities/categories/model/types";
import type { T_Locale } from "@/shared/i18n";


export type T_EditCategoryData = {
    id: string,
    name: string;
    description: string;
    slug: string,
    status: T_CategoriesStatus;
    defaultLocale: T_Locale;
    translations: Partial<Record<T_Locale, T_CategoryTranslation>>;
};

export type T_EditCategoryFormProps = {
    category: T_Categories;
    onCancel: () => void;
    onUpdate: (category: T_Categories) => void;
};
