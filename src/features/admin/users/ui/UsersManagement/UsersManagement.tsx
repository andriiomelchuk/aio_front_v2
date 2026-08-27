"use client";
import { type T_User } from "@/entities/user";
import { Pagination } from "@/shared/ui";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";

import { paginate } from "@/lib/paginate";

import { useI18n } from "@/shared/i18n";
import { useEffect, useState } from "react";
import { UsersToolbar } from "../UsersToolbar";
import { UsersBulkActions } from "../UsersBulkActions";
import { UsersModals } from "../UsersModals";
import { filterUsers, getUserColumns, mapUserRows, sortUsers, useUsersTableControls } from "../../model";
import { getUsers } from "@/shared/api/users";

export function UsersManagement() {
  const { t } = useI18n();

  const tableControls = useUsersTableControls();
 
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<T_User | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [selectedUserIds, setSelectedUserIds] = useState<
    Array<string | number>
  >([]);

  const [bulkAction, setBulkAction] = useState("");

  const [users, setUsers] = useState<T_User[]>([]);

  useEffect(() => {
  const loadUsers = async () => {
    const users = await getUsers();
    setUsers(users);
  };

  loadUsers();
}, []);

  const filteredUsers = filterUsers(users, {
    status: tableControls.status,
    search: tableControls.search,
  });

  const sortedUsers = sortUsers(filteredUsers, tableControls.sort);

  const paginatedUsers = paginate(
    sortedUsers,
    tableControls.page,
    tableControls.pageSize,
  );

  const handleConfirmBulkAction = () => {
    if (bulkAction === "block") {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          selectedUserIds.includes(user.id)
            ? { ...user, status: "blocked" }
            : user,
        ),
      );
    }

    if (bulkAction === "active") {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          selectedUserIds.includes(user.id)
            ? { ...user, status: "active" }
            : user,
        ),
      );
    }

    if (bulkAction === "delete") {
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedUserIds.includes(user.id)),
      );
    }

    setSelectedUserIds([]);
    setBulkAction("");
  };

  const handleCloseEditUser = () => {
    setSelectedUser(null);
  };

  const handleUpdateUser = (updatedUser: T_User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      ),
    );

    setSelectedUser(null);
  };

  const userRows = mapUserRows(paginatedUsers, t, setSelectedUser);

  const userColumns = getUserColumns(t);

  return (
    <AdminPage
      actions={
        <UsersToolbar
          tableControls={tableControls}
          onAddUserClick={() => setIsAddUserOpen(true)}
        />
      }
    >
      <AdminCard
        title={t("admin.user.pageTitle")}
        description={t("admin.user.description", {
          shown: paginatedUsers.length,
          total: users.length,
        })}
      >
        <AdminTable
          columns={userColumns}
          rows={userRows}
          getRowKey={(user) => user.id}
          selectedRowKey={selectedUserId}
          onRowClick={(user) => setSelectedUserId(user.id)}
          selectedRowKeys={selectedUserIds}
          onSelectedRowKeysChange={setSelectedUserIds}
          emptyText={t("admin.user.noUserFound")}
        />

        <UsersBulkActions
          selectedCount={selectedUserIds.length}
          selectedAction={bulkAction}
          onActionChange={setBulkAction}
          onConfirm={handleConfirmBulkAction}
        />

        <Pagination
          page={tableControls.page}
          pageSize={tableControls.pageSize}
          totalItems={sortedUsers.length}
          onPageChange={tableControls.setPage}
          onPageSizeChange={tableControls.setPageSize}
        />
      </AdminCard>
      <UsersModals
        selectedUser={selectedUser}
        isAddUserOpen={isAddUserOpen}
        onCloseAddUser={() => setIsAddUserOpen(false)}
        onCloseEditUser={handleCloseEditUser}
        onCreateUser={(createdUser) => {
          setUsers((prevUsers) => [createdUser, ...prevUsers]);
          setIsAddUserOpen(false);
        }}
        onUpdateUser={handleUpdateUser}
      />
    </AdminPage>
  );
}
