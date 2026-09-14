import { SyntheticEvent, useState } from "react";
import type { T_AddUserFormProps, T_UserData } from "./types";
import { Button, Input, Select } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { createUser } from "@/shared/api/users";
import { useAdminAccess } from "@/features/auth";
import { assignableStaffRoles, canAssignStaffRoles } from "@/shared/config/adminRoles";

export const AddUserForm = ({ onCancel, onCreate }: T_AddUserFormProps) => {
  const { t } = useI18n();
  const { role } = useAdminAccess();
  const [user, setUser] = useState<T_UserData>({
    name: "",
    login: "",
    email: "",
    password: "",
    role: "",
    status: "",
  });

  const updateUser = (field: keyof T_UserData, value: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!role || !canAssignStaffRoles(role) || !user.role || !user.status) {
      return;
    }

    const createdUser = await createUser({
      name: user.name,
      login: user.login,
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status,
    });
    console.log("Create user:", user);
    onCreate(createdUser);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t("admin.user.form.nameLabel")}
          name="name"
          value={user.name}
          onChange={(event) => updateUser("name", event.target.value)}
          placeholder={t("admin.user.form.namePlaceholder")}
          className="h-10 w-full"
          type="text"
          required
        />

        <Input
          label={t("admin.user.form.loginLabel")}
          name="login"
          value={user.login}
          onChange={(event) => updateUser("login", event.target.value)}
          placeholder={t("admin.user.form.loginPlaceholder")}
          className="h-10 w-full"
          type="text"
          required
        />

        <Input
          label={t("admin.user.form.emailLabel")}
          name="email"
          type="email"
          value={user.email}
          onChange={(event) => updateUser("email", event.target.value)}
          placeholder={t("admin.user.form.emailPlaceholder")}
          className="h-10 w-full"
          required
        />

        <Input
          label={t("admin.user.form.passwordLabel")}
          name="password"
          type="password"
          value={user.password}
          onChange={(event) => updateUser("password", event.target.value)}
          placeholder={t("admin.user.form.passwordPlaceholder")}
          className="h-10 w-full"
          required
        />

        <Select
          label={t("admin.user.form.roleLabel")}
          name="role"
          required
          value={user.role}
          onChange={(event) => updateUser("role", event.target.value)}
          options={[
            { value: "", label: t("admin.user.form.rolePlaceholder") },
            ...assignableStaffRoles.map((staffRole) => ({
              value: staffRole,
              label: t(`admin.auth.role.${staffRole}`),
            })),
          ]}
        />

        <Select
          label={t("admin.user.form.statusLabel")}
          name="status"
          required
          value={user.status}
          onChange={(event) => updateUser("status", event.target.value)}
          options={[
            { value: "", label: t("admin.user.form.statusPlaceholder") },
            { value: "active", label: t("admin.user.status.active") },
            { value: "invited", label: t("admin.user.status.invited") },
            { value: "blocked", label: t("admin.user.status.blocked") },
          ]}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="h-10 w-full sm:w-auto"
          onClick={onCancel}
        >
          {t("admin.actions.cancel")}
        </Button>

        <Button type="submit" variant="default" className="h-10 w-full sm:w-auto">
          {t("admin.actions.createUser")}
        </Button>
      </div>
    </form>
  );
};
