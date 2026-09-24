"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { T_Locale } from "@/shared/i18n";
import type { T_Service, T_ServiceAddOn, T_ServiceMaterial, T_ServiceTranslation, T_ServiceVariant, T_ServicesState } from "@/entities/service";
import type { T_Product } from "@/entities/product";
import type { T_WarehouseState } from "@/entities/warehouse";
import { useAdminAccess } from "@/features/auth";
import { useUnsavedChanges } from "@/shared/hooks";
import { getServicesState, saveService, ServicesApiError, type T_SaveServiceDto } from "@/shared/api/services";
import { getProducts } from "@/shared/api/products";
import { getWarehouseState } from "@/shared/api/warehouse";
import { useI18n } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";
import { Button, Checkbox, ImagePicker, Input, Select, Textarea } from "@/shared/ui";
import { AdminCard, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";

const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const emptyTranslation = (): T_ServiceTranslation => ({ title: "", shortDescription: "", description: "", seoTitle: "", seoDescription: "", variantTitles: {}, addOnTitles: {} });
const emptyState: T_ServicesState = { categories: [], services: [], providers: [], locations: [], appointments: [] };
const emptyWarehouseState: T_WarehouseState = { warehouses: [], inventoryItems: [], balances: [], movements: [] };

const createInitial = (defaultLocale: T_Locale, updatedBy: string): T_SaveServiceDto => ({
  categoryId: "", title: "", slug: "", shortDescription: "", description: "", imageUrl: "",
  seo: { title: "", description: "", keywords: [] }, priceType: "fixed", price: 0, currency: "EUR",
  durationMinutes: 60, preparationMinutes: 0, cleanupMinutes: 0, bookingIntervalMinutes: 30, capacity: 1,
  variants: [], addOns: [], providerIds: [], locationIds: [], relatedProductIds: [], materials: [], status: "draft",
  defaultLocale, translations: {}, updatedBy,
});

const toInput = (service: T_Service): T_SaveServiceDto => {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...input } = service;
  void _createdAt; void _updatedAt;
  return input;
};

export const ServiceEditor = ({ serviceId }: { serviceId?: string }) => {
  const router = useRouter();
  const { t } = useI18n();
  const settings = useSiteSettings();
  const { canManage, session } = useAdminAccess();
  const actor = session?.displayName ?? "Staff";
  const [state, setState] = useState<T_ServicesState>(emptyState);
  const [warehouseState, setWarehouseState] = useState<T_WarehouseState>(emptyWarehouseState);
  const [products, setProducts] = useState<T_Product[]>([]);
  const [form, setForm] = useState<T_SaveServiceDto>(() => createInitial(settings.localization.defaultLocale, actor));
  const [selectedLocale, setSelectedLocale] = useState<T_Locale>(settings.localization.enabledLocales.find((locale) => locale !== settings.localization.defaultLocale) ?? settings.localization.defaultLocale);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const isDirty = Boolean(savedSnapshot) && JSON.stringify(form) !== savedSnapshot;
  useUnsavedChanges(isDirty);

  useEffect(() => {
    Promise.all([getServicesState(), getWarehouseState(), getProducts()]).then(([nextState, nextWarehouseState, nextProducts]) => {
      setState(nextState);
      setWarehouseState(nextWarehouseState); setProducts(nextProducts);
      const service = serviceId ? nextState.services.find((item) => item.id === serviceId) : undefined;
      const nextForm = service ? toInput(service) : createInitial(settings.localization.defaultLocale, actor);
      setForm(nextForm); setSavedSnapshot(JSON.stringify(nextForm));
      setSelectedLocale(settings.localization.enabledLocales.find((locale) => locale !== nextForm.defaultLocale) ?? nextForm.defaultLocale);
    }).catch(() => setError(t("admin.services.error.load"))).finally(() => setIsLoading(false));
  }, [actor, serviceId, settings.localization.defaultLocale, settings.localization.enabledLocales, t]);

  const translationLocales = settings.localization.enabledLocales.filter((locale) => locale !== form.defaultLocale);
  const translation = form.translations[selectedLocale] ?? emptyTranslation();
  const patch = (values: Partial<T_SaveServiceDto>) => setForm((current) => ({ ...current, ...values }));
  const patchTranslation = (values: Partial<T_ServiceTranslation>) => setForm((current) => ({ ...current, translations: { ...current.translations, [selectedLocale]: { ...(current.translations[selectedLocale] ?? emptyTranslation()), ...values } } }));
  const addVariant = () => patch({ variants: [...form.variants, { id: createId(), title: "", price: form.price, durationMinutes: form.durationMinutes }] });
  const updateVariant = (id: string, values: Partial<T_ServiceVariant>) => patch({ variants: form.variants.map((item) => item.id === id ? { ...item, ...values } : item) });
  const removeVariant = (id: string) => patch({ variants: form.variants.filter((item) => item.id !== id), translations: Object.fromEntries(Object.entries(form.translations).map(([locale, item]) => [locale, item ? { ...item, variantTitles: Object.fromEntries(Object.entries(item.variantTitles).filter(([key]) => key !== id)) } : item])) });
  const addAddOn = () => patch({ addOns: [...form.addOns, { id: createId(), title: "", price: 0, durationMinutes: 0 }] });
  const updateAddOn = (id: string, values: Partial<T_ServiceAddOn>) => patch({ addOns: form.addOns.map((item) => item.id === id ? { ...item, ...values } : item) });
  const removeAddOn = (id: string) => patch({ addOns: form.addOns.filter((item) => item.id !== id), translations: Object.fromEntries(Object.entries(form.translations).map(([locale, item]) => [locale, item ? { ...item, addOnTitles: Object.fromEntries(Object.entries(item.addOnTitles).filter(([key]) => key !== id)) } : item])) });
  const addMaterial = () => patch({ materials: [...form.materials, { id: createId(), itemType: "consumable", itemId: "", quantity: 1, warehouseId: "", locationId: "" }] });
  const updateMaterial = (id: string, values: Partial<T_ServiceMaterial>) => patch({ materials: form.materials.map((item) => item.id === id ? { ...item, ...values } : item) });
  const removeMaterial = (id: string) => patch({ materials: form.materials.filter((item) => item.id !== id) });

  const errors = useMemo(() => {
    const items: string[] = [];
    if (!form.title.trim()) items.push(t("admin.services.validation.title"));
    if (!form.slug.trim()) items.push(t("admin.services.validation.slug"));
    if (!form.categoryId) items.push(t("admin.services.validation.category"));
    if (form.price < 0 || form.durationMinutes <= 0 || form.bookingIntervalMinutes <= 0 || form.capacity <= 0) items.push(t("admin.services.validation.numbers"));
    if (form.variants.some((item) => !item.title.trim())) items.push(t("admin.services.validation.variants"));
    if (form.addOns.some((item) => !item.title.trim())) items.push(t("admin.services.validation.addOns"));
    if (form.materials.some((item) => !item.itemId || !item.warehouseId || !item.locationId || item.quantity <= 0)) items.push(t("admin.services.validation.materials"));
    return items;
  }, [form, t]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (errors.length || !canManage) return;
    setIsSaving(true); setError("");
    try { const saved = await saveService({ ...form, updatedBy: actor }); setSavedSnapshot(JSON.stringify(toInput(saved))); router.push("/admin/services"); }
    catch (caught) { setError(caught instanceof ServicesApiError ? caught.message : t("admin.services.error.save")); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <AdminPage title={t("admin.services.editor.loading")}><div /></AdminPage>;
  if (serviceId && !form.id) return <AdminPage title={t("admin.services.editor.notFound")}><div /></AdminPage>;

  return <AdminPage title={serviceId ? t("admin.services.editor.editTitle") : t("admin.services.editor.createTitle")} description={t("admin.services.editor.description")} actions={<><Button variant="secondary" className="h-10" onClick={() => router.push("/admin/services")}>{t("admin.actions.cancel")}</Button><Button type="submit" form="service-editor-form" className="h-10" disabled={!canManage || isSaving || errors.length > 0}>{isSaving ? t("admin.form.saving") : t("admin.actions.saveChanges")}</Button></>}>
    <form id="service-editor-form" className="space-y-5" onSubmit={(event) => void submit(event)}>
      <AdminFormAlert message={error} title={errors.length ? t("admin.validation.formErrorTitle") : undefined} messages={errors} />
      <div className="grid gap-5 xl:grid-cols-2">
        <AdminCard title={t("admin.services.editor.main")}><div className="grid gap-4 sm:grid-cols-2"><Input required label={t("admin.services.fields.title")} value={form.title} onChange={(event) => patch({ title: event.target.value })} /><Input required label="Slug" value={form.slug} onChange={(event) => patch({ slug: event.target.value })} /><Select required label={t("admin.services.fields.category")} value={form.categoryId} onChange={(event) => patch({ categoryId: event.target.value })} options={[{ value: "", label: t("admin.services.selectCategory") }, ...state.categories.filter((item) => item.status === "active").map((item) => ({ value: item.id, label: item.name }))]} /><Select label={t("admin.services.fields.status")} value={form.status} onChange={(event) => patch({ status: event.target.value as T_Service["status"] })} options={["draft", "active", "archived"].map((value) => ({ value, label: value }))} /><Input className="sm:col-span-2" label={t("admin.services.fields.shortDescription")} value={form.shortDescription} onChange={(event) => patch({ shortDescription: event.target.value })} /><Textarea className="sm:col-span-2" label={t("admin.services.fields.description")} value={form.description} onChange={(event) => patch({ description: event.target.value })} /></div></AdminCard>
        <AdminCard title={t("admin.services.editor.media")}><ImagePicker label={t("admin.services.fields.image")} value={form.imageUrl} alt={form.title} onChange={(imageUrl) => patch({ imageUrl })} /></AdminCard>
        <AdminCard title={t("admin.services.editor.pricing")}><div className="grid gap-4 sm:grid-cols-3"><Select label={t("admin.services.fields.priceType")} value={form.priceType} onChange={(event) => patch({ priceType: event.target.value as T_Service["priceType"] })} options={[{ value: "fixed", label: t("admin.services.priceType.fixed") }, { value: "from", label: t("admin.services.priceType.from") }]} /><Input type="number" min="0" step="0.01" label={t("admin.services.fields.price")} value={form.price} onChange={(event) => patch({ price: Number(event.target.value) })} /><Input type="number" min="0" step="0.01" label={t("admin.services.fields.oldPrice")} value={form.oldPrice ?? ""} onChange={(event) => patch({ oldPrice: event.target.value === "" ? undefined : Number(event.target.value) })} /><Select label={t("admin.services.fields.currency")} value={form.currency} onChange={(event) => patch({ currency: event.target.value as T_Service["currency"] })} options={["UAH", "USD", "EUR", "GBP"].map((value) => ({ value, label: value }))} /><Input type="number" min="1" label={t("admin.services.fields.duration")} value={form.durationMinutes} onChange={(event) => patch({ durationMinutes: Number(event.target.value) })} /><Input type="number" min="0" label={t("admin.services.fields.preparation")} value={form.preparationMinutes} onChange={(event) => patch({ preparationMinutes: Number(event.target.value) })} /><Input type="number" min="0" label={t("admin.services.fields.cleanup")} value={form.cleanupMinutes} onChange={(event) => patch({ cleanupMinutes: Number(event.target.value) })} /><Input type="number" min="5" label={t("admin.services.fields.interval")} value={form.bookingIntervalMinutes} onChange={(event) => patch({ bookingIntervalMinutes: Number(event.target.value) })} /><Input type="number" min="1" label={t("admin.services.fields.capacity")} value={form.capacity} onChange={(event) => patch({ capacity: Number(event.target.value) })} /></div></AdminCard>
        <AdminCard title={t("admin.services.editor.availability")}><div className="grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-sm font-medium">{t("admin.services.tabs.providers")}</p><div className="space-y-2">{state.providers.map((item) => <Checkbox key={item.id} label={item.name} checked={form.providerIds.includes(item.id)} onChange={(event) => patch({ providerIds: event.target.checked ? [...form.providerIds, item.id] : form.providerIds.filter((id) => id !== item.id) })} />)}</div></div><div><p className="mb-2 text-sm font-medium">{t("admin.services.tabs.locations")}</p><div className="space-y-2">{state.locations.map((item) => <Checkbox key={item.id} label={item.name} checked={form.locationIds.includes(item.id)} onChange={(event) => patch({ locationIds: event.target.checked ? [...form.locationIds, item.id] : form.locationIds.filter((id) => id !== item.id) })} />)}</div></div></div></AdminCard>
      </div>

      <AdminCard title={t("admin.services.editor.variants")} description={t("admin.services.editor.variantsDescription")}><div className="space-y-3">{form.variants.map((item) => <div key={item.id} className="grid gap-3 border-b border-border pb-3 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_2.5rem]"><Input label={t("admin.services.fields.title")} value={item.title} onChange={(event) => updateVariant(item.id, { title: event.target.value })} /><Input type="number" min="0" step="0.01" label={t("admin.services.fields.price")} value={item.price ?? ""} onChange={(event) => updateVariant(item.id, { price: event.target.value === "" ? undefined : Number(event.target.value) })} /><Input type="number" min="1" label={t("admin.services.fields.duration")} value={item.durationMinutes ?? ""} onChange={(event) => updateVariant(item.id, { durationMinutes: event.target.value === "" ? undefined : Number(event.target.value) })} /><Button variant="danger" className="mt-6 flex h-10 w-10 items-center justify-center p-0" aria-label={t("admin.services.actions.removeVariant")} onClick={() => removeVariant(item.id)}><Trash2 className="h-5 w-5" /></Button></div>)}<Button variant="secondary" className="inline-flex h-10 items-center gap-2" onClick={addVariant}><Plus className="h-4 w-4" />{t("admin.services.actions.addVariant")}</Button></div></AdminCard>
      <AdminCard title={t("admin.services.editor.addOns")} description={t("admin.services.editor.addOnsDescription")}><div className="space-y-3">{form.addOns.map((item) => <div key={item.id} className="grid gap-3 border-b border-border pb-3 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_2.5rem]"><Input label={t("admin.services.fields.title")} value={item.title} onChange={(event) => updateAddOn(item.id, { title: event.target.value })} /><Input type="number" min="0" step="0.01" label={t("admin.services.fields.price")} value={item.price} onChange={(event) => updateAddOn(item.id, { price: Number(event.target.value) })} /><Input type="number" min="0" label={t("admin.services.fields.duration")} value={item.durationMinutes} onChange={(event) => updateAddOn(item.id, { durationMinutes: Number(event.target.value) })} /><Button variant="danger" className="mt-6 flex h-10 w-10 items-center justify-center p-0" aria-label={t("admin.services.actions.removeAddOn")} onClick={() => removeAddOn(item.id)}><Trash2 className="h-5 w-5" /></Button></div>)}<Button variant="secondary" className="inline-flex h-10 items-center gap-2" onClick={addAddOn}><Plus className="h-4 w-4" />{t("admin.services.actions.addAddOn")}</Button></div></AdminCard>
      <AdminCard title={t("admin.services.editor.materials")} description={t("admin.services.editor.materialsDescription")}><div className="space-y-4">{form.materials.map((material) => {
        const warehouse = warehouseState.warehouses.find((item) => item.id === material.warehouseId);
        const itemOptions = material.itemType === "product" ? products.map((item) => ({ value: item.id, label: item.title })) : warehouseState.inventoryItems.filter((item) => item.status === "active").map((item) => ({ value: item.id, label: `${item.name} (${item.unit})` }));
        return <div key={material.id} className="grid gap-3 border-b border-border pb-4 md:grid-cols-2 xl:grid-cols-[9rem_minmax(12rem,1fr)_8rem_minmax(11rem,1fr)_minmax(11rem,1fr)_2.5rem]"><Select label={t("admin.services.fields.materialType")} value={material.itemType} onChange={(event) => updateMaterial(material.id, { itemType: event.target.value as T_ServiceMaterial["itemType"], itemId: "", variantId: undefined })} options={[{ value: "consumable", label: t("admin.services.materialType.consumable") }, { value: "product", label: t("admin.services.materialType.product") }]} /><Select label={t("admin.services.fields.material")} value={material.itemId} onChange={(event) => updateMaterial(material.id, { itemId: event.target.value })} options={[{ value: "", label: t("admin.services.selectMaterial") }, ...itemOptions]} /><Input type="number" min="0.001" step="0.001" label={t("admin.services.fields.materialQuantity")} value={material.quantity} onChange={(event) => updateMaterial(material.id, { quantity: Number(event.target.value) })} /><Select label={t("admin.services.fields.warehouse")} value={material.warehouseId} onChange={(event) => updateMaterial(material.id, { warehouseId: event.target.value, locationId: "" })} options={[{ value: "", label: t("admin.services.selectWarehouse") }, ...warehouseState.warehouses.filter((item) => item.status === "active").map((item) => ({ value: item.id, label: item.name }))]} /><Select label={t("admin.services.fields.warehouseLocation")} value={material.locationId} onChange={(event) => updateMaterial(material.id, { locationId: event.target.value })} options={[{ value: "", label: t("admin.services.selectWarehouseLocation") }, ...(warehouse?.locations.map((item) => ({ value: item.id, label: item.name })) ?? [])]} /><Button variant="danger" className="mt-6 flex h-10 w-10 items-center justify-center p-0" aria-label={t("admin.services.actions.removeMaterial")} onClick={() => removeMaterial(material.id)}><Trash2 className="h-5 w-5" /></Button></div>;
      })}<Button variant="secondary" className="inline-flex h-10 items-center gap-2" onClick={addMaterial}><Plus className="h-4 w-4" />{t("admin.services.actions.addMaterial")}</Button></div></AdminCard>
      <AdminCard title="SEO"><div className="grid gap-4"><Input label="SEO title" value={form.seo.title} onChange={(event) => patch({ seo: { ...form.seo, title: event.target.value } })} /><Textarea label="SEO description" value={form.seo.description} onChange={(event) => patch({ seo: { ...form.seo, description: event.target.value } })} /><Input label="Keywords" value={form.seo.keywords.join(", ")} onChange={(event) => patch({ seo: { ...form.seo, keywords: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } })} /></div></AdminCard>

      {translationLocales.length > 0 && <AdminCard title={t("admin.services.editor.translations")} description={t("admin.services.editor.translationsDescription")}><div className="mb-4 max-w-xs"><Select label={t("admin.product.translations.language")} value={selectedLocale} onChange={(event) => setSelectedLocale(event.target.value as T_Locale)} options={translationLocales.map((locale) => ({ value: locale, label: t(`language.${locale}`) }))} /></div><div className="grid gap-4 sm:grid-cols-2"><Input label={t("admin.services.fields.title")} value={translation.title} onChange={(event) => patchTranslation({ title: event.target.value })} /><Input label="SEO title" value={translation.seoTitle} onChange={(event) => patchTranslation({ seoTitle: event.target.value })} /><Textarea label={t("admin.services.fields.shortDescription")} value={translation.shortDescription} onChange={(event) => patchTranslation({ shortDescription: event.target.value })} /><Textarea label="SEO description" value={translation.seoDescription} onChange={(event) => patchTranslation({ seoDescription: event.target.value })} /><Textarea className="sm:col-span-2" label={t("admin.services.fields.description")} value={translation.description} onChange={(event) => patchTranslation({ description: event.target.value })} />
        {form.variants.map((item) => <Input key={item.id} label={`${t("admin.services.editor.variantTranslation")}: ${item.title || "-"}`} value={translation.variantTitles[item.id] ?? ""} onChange={(event) => patchTranslation({ variantTitles: { ...translation.variantTitles, [item.id]: event.target.value } })} />)}
        {form.addOns.map((item) => <Input key={item.id} label={`${t("admin.services.editor.addOnTranslation")}: ${item.title || "-"}`} value={translation.addOnTitles[item.id] ?? ""} onChange={(event) => patchTranslation({ addOnTitles: { ...translation.addOnTitles, [item.id]: event.target.value } })} />)}
      </div></AdminCard>}
    </form>
  </AdminPage>;
};
