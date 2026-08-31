"use client";

import { useI18n } from "@/shared/i18n";
import { useState, type SyntheticEvent } from "react";
import type { T_EditOrderData, T_EditOrderFormProps } from "./types";
import { Button, Input, Select } from "@/shared/ui";
import { updateOrder } from "@/shared/api/orders";



export const EditOrderForm = ({
  order,
  onCancel,
  onUpdate,
}: T_EditOrderFormProps) => {
  const { t } = useI18n();

  const [formData, setFormData] = useState<T_EditOrderData>({
      orderId: order.id,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

  });

  const updateField = (field: keyof T_EditOrderData, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updatedOrder = await updateOrder({
      ...order,
      ...formData,
    });

    onUpdate(updatedOrder);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* <Input
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

        <Input
          label={t("admin.user.form.passwordLabel")}
          name="password"
          type="password"
          value={formData.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder={t("admin.user.form.passwordPlaceholder")}
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
            { value: "Admin", label: "Admin" },
            { value: "Editor", label: "Editor" },
            { value: "User", label: "User" },
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
        />*/}
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
