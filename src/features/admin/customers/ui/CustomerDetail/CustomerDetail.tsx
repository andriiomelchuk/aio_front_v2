"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Mail, MapPin, Phone, Trash2 } from "lucide-react";
import type { T_Customer, T_CustomerStatus } from "@/entities/customer";
import type { T_Order } from "@/entities/order";
import {
  addCustomerNote,
  deleteCustomerNote,
  getCustomerById,
  updateCustomer,
} from "@/shared/api/customers";
import { getOrders } from "@/shared/api/orders";
import { useI18n } from "@/shared/i18n";
import { Button, DataState, Input, Select, Switch, Textarea, useToast } from "@/shared/ui";
import { AdminBadge, AdminCard, AdminPage } from "@/widgets/AdminWidgets";
import { useAdminAccess } from "@/features/auth";

const localeCodes = { en: "en-US", uk: "uk-UA", ru: "ru-RU", de: "de-DE" } as const;

const getCustomerData = async (customerId: string) => {
  const customer = await getCustomerById(customerId);
  const orders = await getOrders({ customerId, customerEmail: customer.email });
  return { customer, orders };
};

export const CustomerDetail = ({ customerId }: { customerId: string }) => {
  const { t, locale } = useI18n();
  const { canManage, session } = useAdminAccess();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<T_Customer | null>(null);
  const [orders, setOrders] = useState<T_Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const loadCustomerData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await getCustomerData(customerId);
      setCustomer(data.customer);
      setOrders(data.orders);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    let isCurrent = true;
    getCustomerData(customerId)
      .then((data) => {
        if (!isCurrent) return;
        setCustomer(data.customer);
        setOrders(data.orders);
      })
      .catch(() => {
        if (isCurrent) setHasError(true);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => { isCurrent = false; };
  }, [customerId]);

  const totalsByCurrency = useMemo(() => {
    return orders.reduce<Record<string, { total: number; count: number }>>(
      (totals, order) => {
        const currency = order.currency ?? "USD";
        const current = totals[currency] ?? { total: 0, count: 0 };
        totals[currency] = {
          total: current.total + (order.totals?.total ?? order.price),
          count: current.count + 1,
        };
        return totals;
      },
      {},
    );
  }, [orders]);

  const formatCurrencyTotals = (average = false) => {
    const entries = Object.entries(totalsByCurrency);
    if (!entries.length) return "-";
    return entries.map(([currency, value]) =>
      new Intl.NumberFormat(localeCodes[locale], { style: "currency", currency }).format(
        average ? value.total / value.count : value.total,
      ),
    ).join(" / ");
  };

  const handleStatusChange = async (status: T_CustomerStatus) => {
    if (!customer) return;
    try {
      const updatedCustomer = await updateCustomer({ id: customer.id, status });
      setCustomer(updatedCustomer);
      showToast({ message: t("admin.customers.notification.statusSaved") });
    } catch {
      showToast({ message: t("admin.customers.error.saveFailed"), variant: "error" });
    }
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    setIsSavingProfile(true);
    try {
      const updatedCustomer = await updateCustomer({
        id: customer.id,
        type: customer.type,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        company: customer.type === "business" ? customer.company : undefined,
        marketingConsent: customer.marketingConsent,
      });
      setCustomer(updatedCustomer);
      showToast({ message: t("admin.customers.notification.profileSaved") });
    } catch {
      showToast({ message: t("admin.customers.error.saveFailed"), variant: "error" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteText.trim()) return;
    setIsSaving(true);
    try {
      await addCustomerNote(customerId, {
        text: noteText,
        authorName: session?.displayName ?? t("admin.customers.notes.defaultAuthor"),
      });
      setNoteText("");
      await loadCustomerData();
      showToast({ message: t("admin.customers.notification.noteAdded") });
    } catch {
      showToast({ message: t("admin.customers.error.saveFailed"), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteCustomerNote(customerId, noteId);
      await loadCustomerData();
      showToast({ message: t("admin.customers.notification.noteDeleted"), variant: "info" });
    } catch {
      showToast({ message: t("admin.customers.error.saveFailed"), variant: "error" });
    }
  };

  if (isLoading) return <DataState variant="loading" title={t("admin.customers.loading")} />;
  if (hasError) return <DataState variant="error" onAction={() => void loadCustomerData()} />;
  if (!customer) return <DataState variant="empty" title={t("admin.customers.notFound")} />;

  const latestOrder = orders[0];
  return (
    <AdminPage
      title={`${customer.firstName} ${customer.lastName}`.trim()}
      description={t("admin.customers.detailDescription", { id: customer.id })}
      actions={<>{canManage && <Select aria-label={t("admin.customers.statusLabel")} value={customer.status} onChange={(event) => handleStatusChange(event.target.value as T_CustomerStatus)} options={[{ value: "active", label: t("admin.customers.status.active") }, { value: "inactive", label: t("admin.customers.status.inactive") }, { value: "blocked", label: t("admin.customers.status.blocked") }]} />}<Link href="/admin/customers" className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-surface-muted">{t("admin.customers.back")}</Link></>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard title={t("admin.customers.metrics.orders")}><p className="text-2xl font-bold">{orders.length}</p></AdminCard>
        <AdminCard title={t("admin.customers.metrics.spent")}><p className="text-lg font-bold">{formatCurrencyTotals()}</p></AdminCard>
        <AdminCard title={t("admin.customers.metrics.average")}><p className="text-lg font-bold">{formatCurrencyTotals(true)}</p></AdminCard>
        <AdminCard title={t("admin.customers.metrics.lastOrder")}><p className="text-sm font-semibold">{latestOrder ? new Intl.DateTimeFormat(localeCodes[locale], { dateStyle: "medium" }).format(new Date(latestOrder.createdAt)) : "-"}</p></AdminCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AdminCard title={t("admin.customers.contacts.title")} description={t("admin.customers.contacts.description")}>
            <fieldset disabled={!canManage || isSavingProfile} className="grid gap-4 border-0 p-0 sm:grid-cols-2 disabled:opacity-80">
              <Input required type="text" label={t("checkout.field.firstName")} value={customer.firstName} onChange={(event) => setCustomer({ ...customer, firstName: event.target.value })} />
              <Input required type="text" label={t("checkout.field.lastName")} value={customer.lastName} onChange={(event) => setCustomer({ ...customer, lastName: event.target.value })} />
              <Input required type="email" label={t("checkout.field.email")} value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
              <Input type="tel" label={t("checkout.field.phone")} value={customer.phone ?? ""} onChange={(event) => setCustomer({ ...customer, phone: event.target.value || undefined })} />
              <Select label={t("admin.customers.typeLabel")} value={customer.type} onChange={(event) => setCustomer({ ...customer, type: event.target.value as T_Customer["type"], company: event.target.value === "business" ? customer.company ?? { name: "" } : undefined })} options={[{ value: "individual", label: t("admin.customers.type.individual") }, { value: "business", label: t("admin.customers.type.business") }]} />
              <Switch label={t("admin.customers.marketingLabel")} checked={customer.marketingConsent} onChange={(event) => setCustomer({ ...customer, marketingConsent: event.target.checked })} />
              {customer.type === "business" && <>
                <Input required type="text" label={t("admin.customers.companyLabel")} value={customer.company?.name ?? ""} onChange={(event) => setCustomer({ ...customer, company: { ...customer.company, name: event.target.value } })} />
                <Input type="text" label={t("admin.customers.taxIdLabel")} value={customer.company?.taxId ?? ""} onChange={(event) => setCustomer({ ...customer, company: { name: customer.company?.name ?? "", taxId: event.target.value || undefined } })} />
              </>}
              {canManage && <Button type="button" className="sm:col-start-2" onClick={() => void handleSaveProfile()} disabled={isSavingProfile}>{isSavingProfile ? t("admin.form.saving") : t("admin.customers.actions.saveProfile")}</Button>}
            </fieldset>
            {!canManage && <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted"><a className="inline-flex items-center gap-2 hover:text-accent" href={`mailto:${customer.email}`}><Mail aria-hidden="true" className="h-4 w-4" />{customer.email}</a>{customer.phone && <a className="inline-flex items-center gap-2 hover:text-accent" href={`tel:${customer.phone}`}><Phone aria-hidden="true" className="h-4 w-4" />{customer.phone}</a>}</div>}
          </AdminCard>

          <AdminCard title={t("admin.customers.orders.title")} description={t("admin.customers.orders.description")}>
            {!orders.length ? <p className="text-sm text-muted">{t("admin.customers.orders.empty")}</p> : <div className="divide-y divide-border">{orders.slice(0, 5).map((order) => <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} key={order.id} className="grid gap-2 py-3 transition first:pt-0 last:pb-0 hover:text-accent sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"><div><p className="break-all font-medium">#{order.id}</p><p className="text-xs text-muted">{new Intl.DateTimeFormat(localeCodes[locale], { dateStyle: "medium" }).format(new Date(order.createdAt))}</p></div><AdminBadge variant={order.status === "completed" ? "success" : order.status === "cancelled" ? "danger" : "warning"}>{t(`admin.orders.status.${order.status}`)}</AdminBadge><p className="font-semibold">{new Intl.NumberFormat(localeCodes[locale], { style: "currency", currency: order.currency ?? "USD" }).format(order.totals?.total ?? order.price)}</p></Link>)}</div>}
          </AdminCard>

          <AdminCard title={t("admin.customers.addresses.title")} description={t("admin.customers.addresses.description")}>
            {!customer.addresses.length ? <p className="text-sm text-muted">{t("admin.customers.addresses.empty")}</p> : <div className="grid gap-3 sm:grid-cols-2">{customer.addresses.map((address) => <address key={address.id} className="rounded-md border border-border p-3 not-italic text-sm"><div className="flex items-center gap-2"><MapPin aria-hidden="true" className="h-4 w-4 text-muted" /><strong>{address.label}</strong></div><p className="mt-2 text-muted">{address.recipientName}<br />{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />{address.postalCode} {address.city}, {address.country}</p></address>)}</div>}
          </AdminCard>
        </div>

        <AdminCard title={t("admin.customers.notes.title")} description={t("admin.customers.notes.description")}>
          {canManage && <form onSubmit={handleAddNote}><Textarea required value={noteText} onChange={(event) => setNoteText(event.target.value)} rows={4} placeholder={t("admin.customers.notes.placeholder")} aria-label={t("admin.customers.notes.label")} /><Button type="submit" className="mt-3 h-10 w-full" disabled={isSaving}>{isSaving ? t("admin.customers.notes.saving") : t("admin.customers.notes.add")}</Button></form>}
          <div className="mt-5 space-y-3 border-t border-border pt-4">{!customer.notes.length ? <p className="text-sm text-muted">{t("admin.customers.notes.empty")}</p> : customer.notes.map((note) => <article key={note.id} className="rounded-md bg-surface-muted p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold">{note.authorName}</p><time className="text-xs text-muted">{new Intl.DateTimeFormat(localeCodes[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(note.createdAt))}</time></div>{canManage && <button type="button" onClick={() => handleDeleteNote(note.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-danger-soft hover:text-danger" aria-label={t("admin.customers.notes.delete")}><Trash2 aria-hidden="true" className="h-4 w-4" /></button>}</div><p className="mt-2 whitespace-pre-wrap break-words text-sm">{note.text}</p></article>)}</div>
        </AdminCard>
      </div>
    </AdminPage>
  );
};
