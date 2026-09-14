"use client";

import { useEffect, useMemo, useState } from "react";
import type { T_Order } from "@/entities/order";
import type { T_User } from "@/entities/user";
import { getOrders } from "@/shared/api/orders";
import { getUsers } from "@/shared/api/users";
import { useI18n } from "@/shared/i18n";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";

const roleOrder = ["owner", "admin", "manager", "viewer"] as const;

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<T_User[]>([]);
  const [orders, setOrders] = useState<T_Order[]>([]);

  useEffect(() => {
    Promise.all([getUsers(), getOrders()]).then(([nextUsers, nextOrders]) => {
      setUsers(nextUsers);
      setOrders(nextOrders);
    });
  }, []);

  const metrics = useMemo(() => ({
    managers: users.filter(({ role }) => role === "manager").length,
    activeOrders: orders.filter(({ status }) => status === "new" || status === "processing").length,
    revenue: orders.filter(({ status }) => status === "completed").reduce((sum, order) => sum + (order.totals?.total ?? order.price), 0),
  }), [orders, users]);

  return (
    <AdminPage title={t("admin.analytics.title")} description={t("admin.analytics.description")}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard title={t("admin.analytics.staffTotal")}><p className="text-2xl font-semibold">{users.length}</p></AdminCard>
        <AdminCard title={t("admin.analytics.managersTotal")}><p className="text-2xl font-semibold">{metrics.managers}</p></AdminCard>
        <AdminCard title={t("admin.analytics.activeOrders")}><p className="text-2xl font-semibold">{metrics.activeOrders}</p></AdminCard>
        <AdminCard title={t("admin.analytics.completedRevenue")}><p className="text-2xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: orders[0]?.currency ?? "USD" }).format(metrics.revenue)}</p></AdminCard>
      </div>

      <div className="mt-4">
        <AdminCard title={t("admin.analytics.staffByRole")} description={t("admin.analytics.staffByRoleDescription")}>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roleOrder.map((role) => (
              <div key={role} className="border border-border bg-background p-4">
                <dt className="text-sm text-muted">{t(`admin.auth.role.${role}`)}</dt>
                <dd className="mt-1 text-xl font-semibold">{users.filter((user) => user.role === role).length}</dd>
              </div>
            ))}
          </dl>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
