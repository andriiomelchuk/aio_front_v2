"use client";
import { mockUsers, T_UserStatus } from "@/entities/user";
import { Button, Input, Pagination, Select } from "@/shared/ui";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { getUserColumns } from "./model/userTableColumns";
import { mapUserRows } from "./model/mapUserRows";
import { filterUsers } from "./model/filterUsers";
import { paginate } from "@/lib/paginate";
import { sortUsers, T_UserSort } from "./model/userSort";
import { useTableControls } from "@/hooks/useTableControls";
import { useI18n } from "@/shared/i18n";

export default function UsersPage() {
  const { t } = useI18n();

  const {
    search,
    status,
    sort,
    page,
    pageSize,
    setSearch,
    setStatus,
    setSort,
    setPage,
    setPageSize,
    resetControls,
    hasActiveControls,
  } = useTableControls<T_UserStatus | "all", T_UserSort>({
    initialStatus: "all",
    initialSort: "default",
    initialPageSize: 5,
  });

  const filteredUsers = filterUsers(mockUsers, { status, search });

  const sortedUsers = sortUsers(filteredUsers, sort);

  const paginatedUsers = paginate(sortedUsers, page, pageSize);

  const userRows = mapUserRows(paginatedUsers, t);

  const userColumns = getUserColumns(t);

  return (
    <AdminPage
      actions={
        <>
          <Input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder={t("admin.user.searchPlaceholder")}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as T_UserStatus | "all");
            }}
            options={[
              { value: "all", label: t("admin.user.status.allUsers") },
              { value: "active", label: t("admin.user.status.active") },
              { value: "invited", label: t("admin.user.status.invited") },
              { value: "blocked", label: t("admin.user.status.blocked") },
            ]}
          ></Select>
          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as T_UserSort);
            }}
            options={[
              { value: "default", label: t("admin.user.sorting.default") },
              { value: "name-asc", label: t("admin.user.sorting.nameAToZ") },
              { value: "name-desc", label: t("admin.user.sorting.nameZToA") },
              { value: "role-asc", label: t("admin.user.sorting.roleAToZ") },
              {
                value: "status-asc",
                label: t("admin.user.sorting.statusAToZ"),
              },
            ]}
          />
          {hasActiveControls && (
            <Button variant="ghost" onClick={resetControls}>
              {t("admin.actions.clearFilters")}
            </Button>
          )}
          <Button
            variant="default"
            className="h-10 ml-auto"
            onClick={() => console.log("Add user")}
          >
            {t("admin.actions.addUser")}
          </Button>
        </>
      }
    >
      <AdminCard
        title={t("admin.user.pageTitle")}
        description={t("admin.user.description", {
          shown: filteredUsers.length,
          total: mockUsers.length,
        })}
      >
        <AdminTable
          columns={userColumns}
          rows={userRows}
          getRowKey={(user) => user.id}
          emptyText={t("admin.user.noUserFound")}
        />
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={sortedUsers.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </AdminCard>
    </AdminPage>
  );
}
