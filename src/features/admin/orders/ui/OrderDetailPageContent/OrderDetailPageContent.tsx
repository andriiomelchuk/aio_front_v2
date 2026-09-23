"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { T_Order } from "@/entities/order";
import { getOrderById } from "@/shared/api/orders";
import { useI18n } from "@/shared/i18n";
import { DataState } from "@/shared/ui";
import { AdminPage } from "@/widgets/AdminWidgets";
import { EditOrderForm } from "../EditOrderForm";

export const OrderDetailPageContent = ({ orderId }: { orderId: string }) => {
  const { t } = useI18n();
  const router = useRouter();
  const [order, setOrder] = useState<T_Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    getOrderById(orderId)
      .then((loadedOrder) => { if (isCurrent) setOrder(loadedOrder); })
      .catch(() => { if (isCurrent) setHasError(true); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [orderId, reloadKey]);

  if (isLoading) return <DataState variant="loading" />;
  if (hasError) return <DataState variant="error" onAction={() => { setIsLoading(true); setHasError(false); setReloadKey((value) => value + 1); }} />;
  if (!order) return <DataState variant="empty" title={t("admin.order.notFound")} />;

  return (
    <AdminPage title={t("admin.order.title", { id: order.id })} description={t("admin.order.description")}>
      <EditOrderForm order={order} onCancel={() => router.push("/admin/orders")} onUpdate={setOrder} />
    </AdminPage>
  );
};
