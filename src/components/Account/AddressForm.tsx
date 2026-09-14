"use client";

import { useState, type FormEvent } from "react";
import type { T_CustomerAddress } from "@/entities/customer";
import { useI18n } from "@/shared/i18n";
import { Button, Input, Select } from "@/shared/ui";
import type { T_AddressFormProps } from "./types";

const createAddressId = () => crypto.randomUUID();

export const AddressForm = ({ address, onCancel, onSave }: T_AddressFormProps) => {
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const data = new FormData(event.currentTarget);
    const nextAddress: T_CustomerAddress = {
      id: address?.id ?? createAddressId(),
      type: data.get("type") === "billing" ? "billing" : "shipping",
      label: String(data.get("label") ?? "").trim(),
      recipientName: String(data.get("recipientName") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || undefined,
      country: String(data.get("country") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      postalCode: String(data.get("postalCode") ?? "").trim(),
      addressLine1: String(data.get("addressLine1") ?? "").trim(),
      addressLine2: String(data.get("addressLine2") ?? "").trim() || undefined,
    };

    try {
      await onSave(nextAddress);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2" onSubmit={handleSubmit}>
      <Select
        name="type"
        label={t("account.address.type")}
        defaultValue={address?.type ?? "shipping"}
        options={[
          { value: "shipping", label: t("account.address.shipping") },
          { value: "billing", label: t("account.address.billing") },
        ]}
      />
      <Input required name="label" type="text" defaultValue={address?.label} label={t("account.address.label")} />
      <Input required name="recipientName" type="text" autoComplete="name" defaultValue={address?.recipientName} label={t("account.address.recipient")} />
      <Input name="phone" type="tel" autoComplete="tel" defaultValue={address?.phone} label={t("account.profile.phone")} />
      <Input required name="country" type="text" autoComplete="country-name" defaultValue={address?.country} label={t("account.address.country")} />
      <Input required name="city" type="text" autoComplete="address-level2" defaultValue={address?.city} label={t("account.address.city")} />
      <Input required name="postalCode" type="text" autoComplete="postal-code" defaultValue={address?.postalCode} label={t("account.address.postalCode")} />
      <Input required name="addressLine1" type="text" autoComplete="address-line1" defaultValue={address?.addressLine1} label={t("account.address.line1")} />
      <div className="sm:col-span-2">
        <Input name="addressLine2" type="text" autoComplete="address-line2" defaultValue={address?.addressLine2} label={t("account.address.line2")} className="w-full" />
      </div>
      <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="secondary" className="h-10" onClick={onCancel}>{t("account.action.cancel")}</Button>
        <Button type="submit" className="h-10" disabled={isSaving}>{isSaving ? t("account.action.saving") : t("account.action.saveAddress")}</Button>
      </div>
    </form>
  );
};
