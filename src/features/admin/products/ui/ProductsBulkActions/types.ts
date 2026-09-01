import type { T_ProductStatus } from "@/entities/product/model/types";

export type T_ProductBulkAction = T_ProductStatus | "delete" | "";

export type T_ProductsBulkActionsProps = {
  selectedCount: number;
  selectedAction: T_ProductBulkAction;
  onActionChange: (action: T_ProductBulkAction) => void;
  onConfirm: () => void;
};
