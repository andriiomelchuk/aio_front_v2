"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { T_Order, T_OrderDeliveryMethod, T_OrderPaymentMethod, T_OrderPaymentStatus, T_OrderStatus } from "@/entities/order";
import { useI18n } from "@/shared/i18n";
import { updateOrder } from "@/shared/api/orders";
import { useAdminAccess } from "@/features/auth";
import { Button, Input, Select, Textarea, useToast } from "@/shared/ui";
import { AdminCard } from "@/widgets/AdminWidgets";
import type { T_EditOrderFormProps } from "./types";

export const EditOrderForm = ({ order, onCancel, onUpdate }: T_EditOrderFormProps) => {
  const { t, locale } = useI18n();
  const { showToast } = useToast();
  const { canManage } = useAdminAccess();
  const [formOrder, setFormOrder] = useState<T_Order>(order);
  const [isSaving, setIsSaving] = useState(false);
  const totals = useMemo(() => {
    if (!formOrder.items?.length) return formOrder.totals ?? { subtotal: formOrder.price, discount: 0, delivery: formOrder.delivery?.fee ?? 0, total: formOrder.price };
    const subtotal = formOrder.items.reduce((sum, item) => sum + item.baseUnitPrice * item.quantity, 0);
    const itemsTotal = formOrder.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const delivery = formOrder.delivery?.fee ?? 0;
    return { subtotal, discount: subtotal - itemsTotal, delivery, total: itemsTotal + delivery };
  }, [formOrder.delivery?.fee, formOrder.items, formOrder.price, formOrder.totals]);
  const currency = formOrder.currency ?? "USD";
  const formatPrice = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const updatedOrder = await updateOrder({ ...formOrder, price: totals.total, totals });
      setFormOrder(updatedOrder);
      onUpdate?.(updatedOrder);
      showToast({ message: t("admin.order.notification.saved") });
    } catch {
      showToast({ message: t("admin.order.error.saveFailed"), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset disabled={!canManage} className="min-w-0 border-0 p-0 disabled:opacity-80">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="space-y-5">
          <AdminCard title={t("admin.order.sections.customer")} description={t("admin.order.sections.customerDescription")}>
            {formOrder.customer ? <div className="grid gap-4 sm:grid-cols-2">
              <Input required type="text" label={t("checkout.field.firstName")} value={formOrder.customer.firstName} onChange={(e) => setFormOrder((o) => ({ ...o, customer: { ...o.customer!, firstName: e.target.value } }))} />
              <Input required type="text" label={t("checkout.field.lastName")} value={formOrder.customer.lastName} onChange={(e) => setFormOrder((o) => ({ ...o, customer: { ...o.customer!, lastName: e.target.value } }))} />
              <Input required type="email" label={t("checkout.field.email")} value={formOrder.customer.email} onChange={(e) => setFormOrder((o) => ({ ...o, customer: { ...o.customer!, email: e.target.value } }))} />
              <Input required type="tel" label={t("checkout.field.phone")} value={formOrder.customer.phone} onChange={(e) => setFormOrder((o) => ({ ...o, customer: { ...o.customer!, phone: e.target.value } }))} />
              {formOrder.customerId && <p className="text-sm text-muted sm:col-span-2">{t("admin.order.customerId")}: <span className="text-foreground">{formOrder.customerId}</span></p>}
            </div> : <p className="text-sm text-muted">{t("admin.order.legacyDataUnavailable")}</p>}
          </AdminCard>

          <AdminCard title={t("admin.order.sections.items")} description={t("admin.order.sections.itemsDescription")}>
            {formOrder.items?.length ? <div className="divide-y divide-border">{formOrder.items.map((item) => (
              <div key={`${item.productId}-${item.sku}`} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_110px_120px] sm:items-end">
                <div className="min-w-0"><p className="font-medium">{item.title}</p><p className="mt-1 text-xs text-muted">{item.sku} · {formatPrice(item.unitPrice)}</p></div>
                <Input min={1} step={1} type="number" label={t("admin.order.itemQuantity")} value={item.quantity} onChange={(e) => { const quantity = Math.max(1, Number(e.target.value) || 1); setFormOrder((o) => ({ ...o, items: o.items?.map((current) => current.productId === item.productId && current.sku === item.sku ? { ...current, quantity } : current) })); }} />
                <p className="pb-2 text-right font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
              </div>
            ))}</div> : <p className="text-sm text-muted">{t("admin.order.legacyDataUnavailable")}</p>}
          </AdminCard>

          <AdminCard title={t("admin.order.sections.delivery")}>
            {formOrder.delivery ? <div className="grid gap-4 sm:grid-cols-2">
              <Select label={t("admin.order.deliveryMethod")} value={formOrder.delivery.method} onChange={(e) => setFormOrder((o) => ({ ...o, delivery: { ...o.delivery!, method: e.target.value as T_OrderDeliveryMethod } }))} options={[{ value: "courier", label: t("checkout.delivery.courier") }, { value: "pickup", label: t("checkout.delivery.pickup") }]} />
              <Input min={0} step="0.01" type="number" label={t("admin.order.deliveryFee")} value={formOrder.delivery.fee} onChange={(e) => setFormOrder((o) => ({ ...o, delivery: { ...o.delivery!, fee: Math.max(0, Number(e.target.value) || 0) } }))} />
              {formOrder.delivery.method === "courier" && <>
                <Input required type="text" label={t("checkout.field.country")} value={formOrder.delivery.address?.country ?? ""} onChange={(e) => setFormOrder((o) => ({ ...o, delivery: { ...o.delivery!, address: { country: e.target.value, city: o.delivery?.address?.city ?? "", postalCode: o.delivery?.address?.postalCode ?? "", address: o.delivery?.address?.address ?? "" } } }))} />
                <Input required type="text" label={t("checkout.field.city")} value={formOrder.delivery.address?.city ?? ""} onChange={(e) => setFormOrder((o) => ({ ...o, delivery: { ...o.delivery!, address: { country: o.delivery?.address?.country ?? "", city: e.target.value, postalCode: o.delivery?.address?.postalCode ?? "", address: o.delivery?.address?.address ?? "" } } }))} />
                <Input required type="text" label={t("checkout.field.postalCode")} value={formOrder.delivery.address?.postalCode ?? ""} onChange={(e) => setFormOrder((o) => ({ ...o, delivery: { ...o.delivery!, address: { country: o.delivery?.address?.country ?? "", city: o.delivery?.address?.city ?? "", postalCode: e.target.value, address: o.delivery?.address?.address ?? "" } } }))} />
                <Input required type="text" label={t("checkout.field.address")} value={formOrder.delivery.address?.address ?? ""} onChange={(e) => setFormOrder((o) => ({ ...o, delivery: { ...o.delivery!, address: { country: o.delivery?.address?.country ?? "", city: o.delivery?.address?.city ?? "", postalCode: o.delivery?.address?.postalCode ?? "", address: e.target.value } } }))} />
              </>}
            </div> : <p className="text-sm text-muted">{t("admin.order.legacyDataUnavailable")}</p>}
          </AdminCard>

          <AdminCard title={t("admin.order.sections.comments")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Textarea label={t("admin.order.customerComment")} value={formOrder.comment ?? ""} onChange={(e) => setFormOrder((o) => ({ ...o, comment: e.target.value || undefined }))} />
              <Textarea label={t("admin.order.internalNote")} value={formOrder.internalNote ?? ""} onChange={(e) => setFormOrder((o) => ({ ...o, internalNote: e.target.value || undefined }))} />
            </div>
          </AdminCard>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6">
          <AdminCard title={t("admin.order.sections.management")}>
            <div className="space-y-4">
              <Select label={t("admin.orders.table.status")} value={formOrder.status} onChange={(e) => setFormOrder((o) => ({ ...o, status: e.target.value as T_OrderStatus }))} options={[{ value: "new", label: t("admin.orders.status.new") }, { value: "processing", label: t("admin.orders.status.processing") }, { value: "completed", label: t("admin.orders.status.completed") }, { value: "cancelled", label: t("admin.orders.status.cancelled") }]} />
              {formOrder.payment ? <>
                <Select label={t("admin.order.paymentMethod")} value={formOrder.payment.method} onChange={(e) => setFormOrder((o) => ({ ...o, payment: { ...o.payment!, method: e.target.value as T_OrderPaymentMethod } }))} options={[{ value: "card_online", label: t("checkout.payment.cardOnline") }, { value: "paypal", label: t("checkout.payment.paypal") }, { value: "card_on_delivery", label: t("checkout.payment.card") }, { value: "cash_on_delivery", label: t("checkout.payment.cash") }]} />
                <Select label={t("admin.order.paymentStatus")} value={formOrder.payment.status} onChange={(e) => setFormOrder((o) => ({ ...o, payment: { ...o.payment!, status: e.target.value as T_OrderPaymentStatus } }))} options={[{ value: "pending", label: t("account.orders.paymentStatus.pending") }, { value: "paid", label: t("account.orders.paymentStatus.paid") }, { value: "failed", label: t("account.orders.paymentStatus.failed") }, { value: "refunded", label: t("account.orders.paymentStatus.refunded") }]} />
              </> : <p className="text-sm text-muted">{t("admin.order.legacyDataUnavailable")}</p>}
            </div>
          </AdminCard>
          <AdminCard title={t("admin.order.sections.totals")}>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">{t("cart.summary.subtotal")}</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">{t("cart.summary.discount")}</dt><dd>-{formatPrice(totals.discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">{t("cart.summary.shipping")}</dt><dd>{formatPrice(totals.delivery)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>{t("cart.summary.total")}</dt><dd>{formatPrice(totals.total)}</dd></div>
            </dl>
          </AdminCard>
          <AdminCard title={t("admin.order.sections.system")}>
            <dl className="space-y-2 text-sm"><div><dt className="text-muted">{t("admin.orders.table.orderId")}</dt><dd className="break-all">{formOrder.id}</dd></div><div><dt className="text-muted">{t("admin.orders.table.createdAt")}</dt><dd>{formOrder.createdAt}</dd></div><div><dt className="text-muted">{t("admin.orders.table.updatedAt")}</dt><dd>{formOrder.updatedAt}</dd></div></dl>
          </AdminCard>
        </aside>
      </div>
      </fieldset>
      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-background/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" className="h-10" onClick={onCancel}>{t("admin.actions.cancel")}</Button>
        {canManage && <Button type="submit" className="h-10" disabled={isSaving}>{isSaving ? t("account.action.saving") : t("admin.actions.saveChanges")}</Button>}
      </div>
    </form>
  );
};
