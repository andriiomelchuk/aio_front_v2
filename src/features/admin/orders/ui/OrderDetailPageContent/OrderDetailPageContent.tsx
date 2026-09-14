"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { T_Order } from "@/entities/order";
import { getOrderById } from "@/shared/api/orders";
import { useI18n } from "@/shared/i18n";
import { AdminPage } from "@/widgets/AdminWidgets";
import { EditOrderForm } from "../EditOrderForm";

export const OrderDetailPageContent = ({ orderId }: { orderId: string }) => {
  const { t } = useI18n();
  const router = useRouter();
  const [order, setOrder] = useState<T_Order | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    getOrderById(orderId).then(setOrder).catch(() => setHasError(true));
  }, [orderId]);

  if (!order && !hasError) return <p className="py-16 text-center text-muted">{t("admin.product.edit.loading")}</p>;
  if (hasError || !order) return <div className="py-16 text-center"><h1 className="text-xl font-semibold">{t("admin.order.notFound")}</h1><Link href="/admin/orders" className="mt-4 inline-flex text-sm font-medium text-accent hover:underline">{t("admin.order.back")}</Link></div>;

  return (
    <AdminPage title={t("admin.order.title", { id: order.id })} description={t("admin.order.description")}>
      <EditOrderForm order={order} onCancel={() => router.push("/admin/orders")} onUpdate={setOrder} />
    </AdminPage>
  );
};
