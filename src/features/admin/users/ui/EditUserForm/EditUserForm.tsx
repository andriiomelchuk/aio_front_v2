"use client";

import { SyntheticEvent, useEffect, useState } from "react";

import { useI18n } from "@/shared/i18n";
import { Checkbox, Input, Select } from "@/shared/ui";

import type { T_EditUserData, T_EditUserFormProps } from "./types";
import { updateUser } from "@/shared/api/users";
import { useAdminAccess } from "@/features/auth";
import { assignableStaffRoles, canAssignStaffRoles } from "@/shared/config/adminRoles";
import { AdminFormActions, AdminFormAlert } from "@/widgets/AdminWidgets";
import { getCustomRoles, recordCustomRoleAssignment } from "@/shared/api/customRoles";
import type { T_CustomRole } from "@/entities/customRole";

export const EditUserForm = ({
  user,
  onCancel,
  onUpdate,
}: T_EditUserFormProps) => {
  const { t, locale } = useI18n();
  const { role } = useAdminAccess();

  const [formData, setFormData] = useState<T_EditUserData>({
    name: user.name,
    login: user.login,
    email: user.email,
    role: user.role,
    roles: user.roles ?? [user.role],
    status: user.status,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [customRoles, setCustomRoles] = useState<T_CustomRole[]>([]);
  useEffect(() => { void getCustomRoles().then(setCustomRoles); }, []);

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
        roles: [formData.role, ...formData.roles.filter((item) => item !== formData.role)],
      });
      updatedUser.roles?.filter((item) => item.startsWith("custom:") && !(user.roles ?? []).includes(item)).forEach((item) => recordCustomRoleAssignment(item as `custom:${string}`, role, String(updatedUser.id)));
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
            ...customRoles
              .filter((customRole) => customRole.status === "active" || customRole.id === formData.role)
              .map((customRole) => ({
                value: customRole.id,
                label: customRole.translations[locale].name || customRole.translations.uk.name || customRole.translations.en.name || customRole.key,
              })),
          ]}
        />

        <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-medium">{t("admin.roles.additionalRoles")}</legend><div className="grid gap-2 sm:grid-cols-2">{customRoles.map((customRole) => <Checkbox key={customRole.id} label={`${customRole.translations.uk.name}${customRole.status === "archived" ? ` (${t("admin.roles.status.archived")})` : ""}`} disabled={customRole.status === "archived" && !formData.roles.includes(customRole.id)} checked={formData.roles.includes(customRole.id)} onChange={(event) => setFormData((current) => ({ ...current, roles: event.target.checked ? [...current.roles, customRole.id] : current.roles.filter((item) => item !== customRole.id) }))} />)}{!customRoles.length && <p className="text-sm text-muted">{t("admin.roles.noAssignable")}</p>}</div></fieldset>

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
