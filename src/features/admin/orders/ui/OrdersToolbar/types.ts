import type { useOrdersTableControls } from "../../model/useOrdersTableControls";

export type T_OrdersToolbarProps = {
  tableControls: ReturnType<typeof useOrdersTableControls>;
};