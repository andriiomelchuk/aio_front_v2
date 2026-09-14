import type { useProductsTableControls } from "../../model/useProductsTableControls";



export type T_ProductsToolbarProps = {
  tableControls: ReturnType<typeof useProductsTableControls>;
  canManage: boolean;
};
