"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Package, Settings, UserRound } from "lucide-react";
import type { T_Customer, T_CustomerAddress } from "@/entities/customer";
import { useAuth } from "@/features/auth";
import { getCustomerById, updateCustomer } from "@/shared/api/customers";
import { useI18n } from "@/shared/i18n";
import { Button, Checkbox, Input, Select, useToast } from "@/shared/ui";
import { AddressForm } from "./AddressForm";
import { AccountOrders } from "./AccountOrders";
import type { T_AccountSection } from "./types";

const sections = [
  { id: "profile", icon: UserRound, key: "account.navigation.profile" },
  { id: "orders", icon: Package, key: "account.navigation.orders" },
  { id: "addresses", icon: MapPin, key: "account.navigation.addresses" },
  { id: "settings", icon: Settings, key: "account.navigation.settings" },
] as const;

export const AccountManagement = () => {
  const { t } = useI18n();
  const { session, isInitialized, logout, updateIdentity } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [customer, setCustomer] = useState<T_Customer | null>(null);
  const [activeSection, setActiveSection] = useState<T_AccountSection>("profile");
  const [editingAddress, setEditingAddress] = useState<T_CustomerAddress | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [customerType, setCustomerType] = useState<T_Customer["type"]>("individual");

  useEffect(() => {
    if (!isInitialized) return;
    if (!session || session.role !== "customer") {
      router.replace("/login?returnTo=/account");
      return;
    }

    getCustomerById(session.customerId)
      .then((loadedCustomer) => {
        setCustomer(loadedCustomer);
        setCustomerType(loadedCustomer.type);
      })
      .catch(() => setLoadError(true));
  }, [isInitialized, router, session]);

  const saveCustomer = async (changes: Parameters<typeof updateCustomer>[0]) => {
    const updatedCustomer = await updateCustomer(changes);
    setCustomer(updatedCustomer);
    return updatedCustomer;
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer) return;
    setIsSaving(true);
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const type = data.get("type") === "business" ? "business" : "individual";

    try {
      await saveCustomer({
        id: customer.id,
        firstName,
        lastName,
        email,
        phone: String(data.get("phone") ?? "").trim() || undefined,
        type,
        company: type === "business" ? {
          name: String(data.get("companyName") ?? "").trim(),
          taxId: String(data.get("taxId") ?? "").trim() || undefined,
        } : undefined,
      });
      await updateIdentity({ email, displayName: `${firstName} ${lastName}` });
      showToast({ message: t("account.notification.profileSaved") });
    } catch {
      showToast({ message: t("account.error.saveFailed"), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressSave = async (address: T_CustomerAddress) => {
    if (!customer) return;
    const exists = customer.addresses.some(({ id }) => id === address.id);
    const addresses = exists
      ? customer.addresses.map((item) => item.id === address.id ? address : item)
      : [...customer.addresses, address];
    const shippingAddresses = addresses.filter(({ type }) => type === "shipping");
    const billingAddresses = addresses.filter(({ type }) => type === "billing");

    try {
      await saveCustomer({
        id: customer.id,
        addresses,
        defaultShippingAddressId: shippingAddresses.some(({ id }) => id === customer.defaultShippingAddressId) ? customer.defaultShippingAddressId : shippingAddresses[0]?.id,
        defaultBillingAddressId: billingAddresses.some(({ id }) => id === customer.defaultBillingAddressId) ? customer.defaultBillingAddressId : billingAddresses[0]?.id,
      });
      setEditingAddress(null);
      setIsAddingAddress(false);
      showToast({ message: t("account.notification.addressSaved") });
    } catch {
      showToast({ message: t("account.error.saveFailed"), variant: "error" });
    }
  };

  const handleAddressDelete = async (addressId: string) => {
    if (!customer) return;
    try {
      await saveCustomer({
        id: customer.id,
        addresses: customer.addresses.filter(({ id }) => id !== addressId),
        defaultShippingAddressId: customer.defaultShippingAddressId === addressId ? undefined : customer.defaultShippingAddressId,
        defaultBillingAddressId: customer.defaultBillingAddressId === addressId ? undefined : customer.defaultBillingAddressId,
      });
      showToast({ message: t("account.notification.addressDeleted"), variant: "info" });
    } catch {
      showToast({ message: t("account.error.saveFailed"), variant: "error" });
    }
  };

  const handleSetDefault = async (address: T_CustomerAddress) => {
    if (!customer) return;
    try {
      await saveCustomer({
        id: customer.id,
        [address.type === "shipping" ? "defaultShippingAddressId" : "defaultBillingAddressId"]: address.id,
      });
      showToast({ message: t("account.notification.defaultAddressSaved") });
    } catch {
      showToast({ message: t("account.error.saveFailed"), variant: "error" });
    }
  };

  const handleSettingsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer) return;
    setIsSaving(true);
    const data = new FormData(event.currentTarget);
    try {
      await saveCustomer({ id: customer.id, marketingConsent: data.get("marketingConsent") === "on" });
      showToast({ message: t("account.notification.settingsSaved") });
    } catch {
      showToast({ message: t("account.error.saveFailed"), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isInitialized || (!customer && !loadError)) {
    return <p className="py-16 text-center text-muted">{t("account.loading")}</p>;
  }
  if (loadError || !customer) {
    return <p role="alert" className="py-16 text-center text-danger">{t("account.error.loadFailed")}</p>;
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6">
        <p className="text-sm font-medium text-accent">{t("account.eyebrow")}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{t("account.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("account.description")}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col" aria-label={t("account.navigation.label")}>
          {sections.map(({ id, icon: Icon, key }) => (
            <button key={id} type="button" onClick={() => setActiveSection(id)} className={`flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${activeSection === id ? "bg-accent text-background" : "text-foreground hover:bg-surface-muted"}`}>
              <Icon aria-hidden="true" className="h-4 w-4" />{t(key)}
            </button>
          ))}
        </nav>

        <div className="min-w-0 border-t border-border pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          {activeSection === "profile" && (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
              <div className="sm:col-span-2"><h2 className="text-xl font-semibold">{t("account.profile.title")}</h2><p className="mt-1 text-sm text-muted">{t("account.profile.description")}</p></div>
              <Input required name="firstName" type="text" autoComplete="given-name" defaultValue={customer.firstName} label={t("auth.field.firstName")} />
              <Input required name="lastName" type="text" autoComplete="family-name" defaultValue={customer.lastName} label={t("auth.field.lastName")} />
              <Input required name="email" type="email" autoComplete="email" defaultValue={customer.email} label={t("auth.field.email")} />
              <Input name="phone" type="tel" autoComplete="tel" defaultValue={customer.phone} label={t("account.profile.phone")} />
              <Select name="type" value={customerType} onChange={(event) => setCustomerType(event.target.value as T_Customer["type"])} label={t("account.profile.type")} options={[{ value: "individual", label: t("account.profile.individual") }, { value: "business", label: t("account.profile.business") }]} />
              <div />
              {customerType === "business" && <><Input required name="companyName" type="text" defaultValue={customer.company?.name} label={t("account.profile.companyName")} /><Input name="taxId" type="text" defaultValue={customer.company?.taxId} label={t("account.profile.taxId")} /></>}
              <div className="flex justify-end sm:col-span-2"><Button type="submit" className="h-10" disabled={isSaving}>{isSaving ? t("account.action.saving") : t("account.action.save")}</Button></div>
            </form>
          )}

          {activeSection === "addresses" && (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">{t("account.addresses.title")}</h2><p className="mt-1 text-sm text-muted">{t("account.addresses.description")}</p></div><Button className="h-10" onClick={() => { setEditingAddress(null); setIsAddingAddress(true); }}>{t("account.address.add")}</Button></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {customer.addresses.map((address) => {
                  const isDefault = address.type === "shipping" ? customer.defaultShippingAddressId === address.id : customer.defaultBillingAddressId === address.id;
                  return <article key={address.id} className="rounded-md border border-border bg-surface p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{address.label}</h3><p className="text-xs text-muted">{address.type === "shipping" ? t("account.address.shipping") : t("account.address.billing")}</p></div>{isDefault && <span className="rounded-full bg-accent-soft px-2 py-1 text-xs font-medium text-accent">{t("account.address.default")}</span>}</div><address className="mt-3 not-italic text-sm text-muted"><p>{address.recipientName}</p><p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p><p>{address.postalCode} {address.city}, {address.country}</p>{address.phone && <p>{address.phone}</p>}</address><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" className="h-9 px-3" onClick={() => { setIsAddingAddress(false); setEditingAddress(address); }}>{t("account.action.edit")}</Button>{!isDefault && <Button variant="ghost" className="h-9 px-3" onClick={() => handleSetDefault(address)}>{t("account.action.makeDefault")}</Button>}<Button variant="ghost" className="h-9 px-3 text-danger" onClick={() => handleAddressDelete(address.id)}>{t("account.action.delete")}</Button></div></article>;
                })}
              </div>
              {!customer.addresses.length && !isAddingAddress && <p className="mt-6 rounded-md bg-surface-muted p-4 text-sm text-muted">{t("account.addresses.empty")}</p>}
              {(isAddingAddress || editingAddress) && <div className="mt-6"><AddressForm key={editingAddress?.id ?? "new"} address={editingAddress ?? undefined} onCancel={() => { setEditingAddress(null); setIsAddingAddress(false); }} onSave={handleAddressSave} /></div>}
            </div>
          )}

          {activeSection === "orders" && <AccountOrders />}

          {activeSection === "settings" && (
            <form className="flex flex-col gap-5" onSubmit={handleSettingsSubmit}>
              <div><h2 className="text-xl font-semibold">{t("account.settings.title")}</h2><p className="mt-1 text-sm text-muted">{t("account.settings.description")}</p></div>
              <Checkbox name="marketingConsent" defaultChecked={customer.marketingConsent} label={t("auth.field.marketingConsent")} description={t("auth.field.marketingConsentDescription")} />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><Button type="submit" className="h-10" disabled={isSaving}>{isSaving ? t("account.action.saving") : t("account.action.save")}</Button><Button type="button" variant="secondary" className="flex h-10 items-center gap-2" onClick={() => { logout(); router.replace("/"); }}><LogOut aria-hidden="true" className="h-4 w-4" />{t("auth.logout")}</Button></div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
