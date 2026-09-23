import { SyntheticEvent, useState } from "react";
import type { T_AddUserFormProps, T_UserData } from "./types";
import { Input, Select } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { createUser } from "@/shared/api/users";
import { useAdminAccess } from "@/features/auth";
import { assignableStaffRoles, canAssignStaffRoles } from "@/shared/config/adminRoles";
import { AdminFormActions, AdminFormAlert } from "@/widgets/AdminWidgets";

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
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

    setError("");
    setIsSaving(true);
    try {
      const createdUser = await createUser({
        name: user.name,
        login: user.login,
        email: user.email,
        password: user.password,
        role: user.role,
        status: user.status,
      });
      onCreate(createdUser);
    } catch {
      setError(t("admin.user.error.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormAlert message={error} />
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

      <AdminFormActions cancelLabel={t("admin.actions.cancel")} submitLabel={t("admin.actions.createUser")} submittingLabel={t("admin.form.saving")} isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};
