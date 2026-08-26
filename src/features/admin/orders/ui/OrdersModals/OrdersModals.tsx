import { useI18n } from "@/shared/i18n";
import { Modal } from "@/shared/ui";
import type { T_OrdersModalsProps } from "./types";
import { EditOrderForm } from "../EditOrderForm/EditOrderForm";

export const OrdersModals = ({
  onCloseEditOrder,
  onUpdateOrder,
  selectedOrder,
}: T_OrdersModalsProps) => {
  const { t } = useI18n();

  return (
    <>
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          title={t("admin.orders.editOrderTitle")}
          onClose={onCloseEditOrder}
        >
          <EditOrderForm
            order={selectedOrder}
            onCancel={onCloseEditOrder}
            onUpdate={onUpdateOrder}
          />
        </Modal>
      )}
    </>
  );
};
