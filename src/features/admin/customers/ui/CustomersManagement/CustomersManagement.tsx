"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { T_Customer } from "@/entities/customer";
import { getCustomers } from "@/shared/api/customers";
import { useI18n } from "@/shared/i18n";
import { Input } from "@/shared/ui";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { getCustomerColumns, mapCustomerRows } from "../../model";

export const CustomersManagement = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [customers, setCustomers] = useState<T_Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCustomers({ search })
      .then(setCustomers)
      .finally(() => setIsLoading(false));
  }, [search]);

  const rows = mapCustomerRows(customers, t);

  return (
    <AdminPage
      title={t("admin.customers.pageTitle")}
      description={t("admin.customers.pageDescription")}
      actions={
        <Input
          type="search"
          className="h-10 w-full sm:w-72"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("admin.customers.searchPlaceholder")}
          aria-label={t("admin.customers.searchLabel")}
        />
      }
    >
      <AdminCard description={t("admin.customers.count", { count: customers.length })}>
        <AdminTable
          columns={getCustomerColumns(t)}
          rows={rows}
          getRowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/admin/customers/${row.id}`)}
          emptyText={isLoading ? t("admin.customers.loading") : t("admin.customers.empty")}
        />
      </AdminCard>
    </AdminPage>
  );
};
