import { T_Categories } from "@/entities/categories/model/types";


export type T_CategoriesModalsProps = {
  isAddCategoryOpen: boolean;
  selectedCategory: T_Categories | null;
  onCloseAddCategory: () => void;
  onCloseEditCategory: () => void;
  onCreateCategory: (category: T_Categories) => void;
  onUpdateCategory: (category: T_Categories) => void;
};