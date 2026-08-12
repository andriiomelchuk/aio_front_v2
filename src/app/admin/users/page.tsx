"use client";
import { mockUsers, T_UserStatus } from "@/entities/user";
import { Button, Input, Pagination, Select } from "@/shared/ui";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { userColumns } from "./model/userTableColumns";
import { useState } from "react";
import { mapUserRows } from "./model/mapUserRows";
import { filterUsers } from "./model/filterUsers";
import { paginate } from "@/lib/paginate";
import { usePagination } from "@/hooks/usePagination";
import { sortUsers, T_UserSort } from "./model/userSort";
import { useTableControls } from "@/hooks/useTableControls";

export default function UsersPage() {
  // const [search, setSearch] = useState("");
  // const [status, setStatus] = useState<T_UserStatus | "all">("all");
  // const [sort, setSort] = useState<T_UserSort>("default");

  // const { page, pageSize, setPage, setPageSize, resetPage, resetPagination } =
  //   usePagination({
  //     initialPageSize: 5,
  //   });

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

  const userRows = mapUserRows(paginatedUsers);

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
            placeholder="Search user by name"
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as T_UserStatus | "all");
            }}
            options={[
              { value: "all", label: "All users" },
              { value: "active", label: "Active" },
              { value: "invited", label: "Invited" },
              { value: "blocked", label: "Blocked" },
            ]}
          ></Select>
          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as T_UserSort);
            }}
            options={[
              { value: "default", label: "Default sorting" },
              { value: "name-asc", label: "Name A-Z" },
              { value: "name-desc", label: "Name Z-A" },
              { value: "role-asc", label: "Role A-Z" },
              { value: "status-asc", label: "Status A-Z" },
            ]}
          />
          {hasActiveControls && (
            <Button variant="ghost" onClick={resetControls}>
              Clear filters
            </Button>
          )}
          <Button
            variant="default"
            className="h-10 ml-auto"
            onClick={() => console.log("Add user")}
          >
            Add User
          </Button>
        </>
      }
    >
      <AdminCard
        title="Users list"
        description={`Showing ${filteredUsers.length} of ${mockUsers.length} users`}
      >
        <AdminTable
          columns={userColumns}
          rows={userRows}
          getRowKey={(user) => user.id}
          emptyText="No users found"
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
