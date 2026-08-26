import type { T_UserStatus } from "@/entities/user";
import { useI18n } from "@/shared/i18n";
import { Button, Input, Select } from "@/shared/ui";
import type { T_UserSort } from "../../model/userSort";
import type { T_UsersToolbarProps } from "./types";

export const UsersToolbar = ({ tableControls, onAddUserClick, }: T_UsersToolbarProps) => {
  const { t } = useI18n();


  return (
    <>
      <Input
        type="search"
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.search}
        onChange={(e) => {
          tableControls.setSearch(e.target.value);
        }}
        placeholder={t("admin.user.searchPlaceholder")}
      />
      <Select
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.status}
        onChange={(e) => {
          tableControls.setStatus(e.target.value as T_UserStatus | "all");
        }}
        options={[
          { value: "all", label: t("admin.user.status.allUsers") },
          { value: "active", label: t("admin.user.status.active") },
          { value: "invited", label: t("admin.user.status.invited") },
          { value: "blocked", label: t("admin.user.status.blocked") },
        ]}
      ></Select>
      <Select
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.sort}
        onChange={(e) => {
          tableControls.setSort(e.target.value as T_UserSort);
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
      {tableControls.hasActiveControls && (
        <Button
          variant="ghost"
          className="h-10 w-full sm:w-auto"
          onClick={tableControls.resetControls}
        >
          {t("admin.actions.clearFilters")}
        </Button>
      )}
      <Button
        variant="default"
        className="h-10 w-full sm:ml-auto sm:w-auto"
        onClick={onAddUserClick}
      >
        {t("admin.actions.addUser")}
      </Button>
    </>
  );
};
