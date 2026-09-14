"use client";

import { SyntheticEvent, useState } from "react";

import { useI18n } from "@/shared/i18n";
import { Button, Input, Select } from "@/shared/ui";

import type { T_EditUserData, T_EditUserFormProps } from "./types";
import { updateUser } from "@/shared/api/users";
import { useAdminAccess } from "@/features/auth";
import { assignableStaffRoles, canAssignStaffRoles } from "@/shared/config/adminRoles";

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

  const updateField = (field: keyof T_EditUserData, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!role || !canAssignStaffRoles(role) || user.role === "developer") return;

    const updatedUser = await updateUser({
      ...user,
      ...formData,
    });

    onUpdate(updatedUser);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          {t("admin.actions.saveChanges")}
        </Button>
      </div>
    </form>
  );
};
