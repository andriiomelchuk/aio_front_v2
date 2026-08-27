import { useCategoriesTableControls } from "../../model";


export type T_CategoriesToolbarProps = {
  tableControls: ReturnType<typeof useCategoriesTableControls>;
  onAddCategoryClick: () => void;
};