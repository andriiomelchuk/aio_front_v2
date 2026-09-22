"use client";

import { SyntheticEvent, useState } from "react";

import { useI18n } from "@/shared/i18n";
import { Input, Select } from "@/shared/ui";

import type { T_EditUserData, T_EditUserFormProps } from "./types";
import { updateUser } from "@/shared/api/users";
import { useAdminAccess } from "@/features/auth";
import { assignableStaffRoles, canAssignStaffRoles } from "@/shared/config/adminRoles";
import { AdminFormActions, AdminFormAlert } from "@/widgets/AdminWidgets";

export const EditUserForm = ({
  user,
  onCancel,
  onUpdate,
}: T_EditUserFormProps) => {
  const { t } = useI18n();
  const { role } = useAdminAccess();

  const [formData, setFormData] = useState<T_EditUserData>({
    name: user.name,
    login: user.login,
    email: user.email,
    role: user.role,
    status: user.status,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof T_EditUserData, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!role || !canAssignStaffRoles(role) || user.role === "developer") return;

    setError("");
    setIsSaving(true);
    try {
      const updatedUser = await updateUser({
        ...user,
        ...formData,
      });
      onUpdate(updatedUser);
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
          value={formData.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder={t("admin.user.form.namePlaceholder")}
          className="h-10 w-full"
          type="text"
          required
        />

        <Input
          label={t("admin.user.form.loginLabel")}
          name="login"
          value={formData.login}
          onChange={(event) => updateField("login", event.target.value)}
          placeholder={t("admin.user.form.loginPlaceholder")}
          className="h-10 w-full"
          type="text"
          required
        />

        <Input
          label={t("admin.user.form.emailLabel")}
          name="email"
          type="email"
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder={t("admin.user.form.emailPlaceholder")}
          className="h-10 w-full"
          required
        />

        <Select
          label={t("admin.user.form.roleLabel")}
          name="role"
          required
          value={formData.role}
          onChange={(event) => updateField("role", event.target.value)}
          options={[
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
          value={formData.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={[
            { value: "active", label: t("admin.user.status.active") },
            { value: "invited", label: t("admin.user.status.invited") },
            { value: "blocked", label: t("admin.user.status.blocked") },
          ]}
        />
      </div>

      <AdminFormActions cancelLabel={t("admin.actions.cancel")} submitLabel={t("admin.actions.saveChanges")} submittingLabel={t("admin.form.saving")} isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};
