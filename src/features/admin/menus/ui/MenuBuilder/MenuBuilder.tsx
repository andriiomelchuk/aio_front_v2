"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { createMenuLocalizedText, getMenuLocalizedText, type T_MenuItem, type T_MenuStatus } from "@/entities/menu";
import { createMenu, getMenuById, MenusApiError, updateMenu } from "@/shared/api/menus";
import { locales, useI18n, type T_Locale } from "@/shared/i18n";
import { Button, Checkbox, DataState, Input, Select } from "@/shared/ui";
import { AdminCard, AdminFormActions, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";
import { MenuAssignments } from "../MenuAssignments";
import { isMenuItemComplete } from "../../model";
import { useUnsavedChanges } from "@/shared/hooks";

const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const createItem = (): T_MenuItem => ({ id: createId(), label: createMenuLocalizedText(), href: "", openInNewTab: false, isVisible: true, children: [] });

const MenuItemEditor = ({ item, defaultLocale, depth, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onChange, onDelete }: { item: T_MenuItem; defaultLocale: T_Locale; depth: number; canMoveUp: boolean; canMoveDown: boolean; onMoveUp: () => void; onMoveDown: () => void; onChange: (item: T_MenuItem) => void; onDelete: () => void }) => {
  const { t, locale: siteLocale } = useI18n();
  const [locale, setLocale] = useState<T_Locale>(defaultLocale);
  const itemTitle = getMenuLocalizedText(item.label, siteLocale, defaultLocale) || t("admin.menus.form.untitledItem");
  return (
    <section className={`overflow-hidden rounded-md border border-border ${depth > 0 ? "bg-surface-muted" : "bg-surface"}`}>
      <header className="flex min-h-12 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" className="flex h-8 w-8 items-center justify-center p-0" disabled={!canMoveUp} onClick={onMoveUp} aria-label={t("admin.menus.actions.moveUp")}><ChevronUp aria-hidden="true" size={18} style={{ width: 18, height: 18 }} /></Button>
          <Button type="button" variant="ghost" className="flex h-8 w-8 items-center justify-center p-0" disabled={!canMoveDown} onClick={onMoveDown} aria-label={t("admin.menus.actions.moveDown")}><ChevronDown aria-hidden="true" size={18} style={{ width: 18, height: 18 }} /></Button>
        </div>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{itemTitle}</h3>
        <Button type="button" variant="danger" className="flex h-10 w-10 shrink-0 items-center justify-center p-0" aria-label={t("admin.menus.actions.deleteItem")} onClick={onDelete}><Trash2 aria-hidden="true" size={22} strokeWidth={2} style={{ width: 22, height: 22, minWidth: 22, minHeight: 22 }} /></Button>
      </header>

      <div className="space-y-4 p-3 sm:p-4">
        <div className="grid items-end gap-4 md:grid-cols-2">
          <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">{t("admin.menus.form.itemLabel")}</span>
            <Select id={`menu-item-locale-${item.id}`} className="h-8 min-w-24 py-1" aria-label={t("admin.menus.form.itemLocale")} value={locale} onChange={(event) => setLocale(event.target.value as T_Locale)} options={locales.map((value) => ({ value, label: `${value.toUpperCase()}${item.label[value].trim() ? " +" : ""}` }))} />
          </div>
          <Input className="h-10 w-full" type="text" aria-label={`${t("admin.menus.form.itemLabel")} (${locale})`} value={item.label[locale]} onChange={(event) => onChange({ ...item, label: { ...item.label, [locale]: event.target.value } })} />
          </div>
          <label className="block min-w-0 space-y-2">
            <span className="block text-sm font-medium text-foreground">{t("admin.menus.form.itemHref")}</span>
            <Input className="h-10 w-full" type="text" aria-label={t("admin.menus.form.itemHref")} value={item.href} onChange={(event) => onChange({ ...item, href: event.target.value })} />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Checkbox label={t("admin.menus.form.visible")} checked={item.isVisible} onChange={(event) => onChange({ ...item, isVisible: event.target.checked })} />
          <Checkbox label={t("admin.menus.form.newTab")} checked={item.openInNewTab} onChange={(event) => onChange({ ...item, openInNewTab: event.target.checked })} />
          {depth < 2 && <Button type="button" variant="secondary" className="inline-flex h-9 items-center whitespace-nowrap px-3" onClick={() => onChange({ ...item, children: [...item.children, createItem()] })}><Plus className="mr-2 h-4 w-4" />{t("admin.menus.actions.addChild")}</Button>}
        </div>

        {item.children.length > 0 && <div className="space-y-3 border-l-2 border-border pl-3 sm:pl-4">{item.children.map((child, index) => <MenuItemEditor key={child.id} item={child} defaultLocale={defaultLocale} depth={depth + 1} canMoveUp={index > 0} canMoveDown={index < item.children.length - 1} onMoveUp={() => onChange({ ...item, children: arrayMoveItem(item.children, index, -1) })} onMoveDown={() => onChange({ ...item, children: arrayMoveItem(item.children, index, 1) })} onChange={(next) => onChange({ ...item, children: item.children.map((value) => value.id === child.id ? next : value) })} onDelete={() => onChange({ ...item, children: item.children.filter((value) => value.id !== child.id) })} />)}</div>}
      </div>
    </section>
  );
};

const arrayMoveItem = <T,>(items: T[], index: number, direction: -1 | 1) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const nextItems = [...items];
  [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
  return nextItems;
};

export const MenuBuilder = ({ mode, menuId }: { mode: "create" | "edit"; menuId?: string }) => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<T_MenuStatus>("draft");
  const [defaultLocale, setDefaultLocale] = useState<T_Locale>(locale);
  const [items, setItems] = useState<T_MenuItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const currentSnapshot = JSON.stringify({ name, key, status, defaultLocale, items });
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(
    mode === "create" ? currentSnapshot : null,
  );
  const isDirty = initialSnapshot !== null && initialSnapshot !== currentSnapshot;
  useUnsavedChanges(isDirty && !isSaving);

  useEffect(() => {
    if (mode !== "edit" || !menuId) return;
    void getMenuById(menuId).then((menu) => { setName(menu.name); setKey(menu.key); setStatus(menu.status); setDefaultLocale(menu.defaultLocale); setItems(menu.items); setInitialSnapshot(JSON.stringify({ name: menu.name, key: menu.key, status: menu.status, defaultLocale: menu.defaultLocale, items: menu.items })); }).catch(() => setLoadError(true)).finally(() => setIsLoading(false));
  }, [menuId, mode, reloadKey]);

  const move = (index: number, direction: -1 | 1) =>
    setItems((current) => arrayMoveItem(current, index, direction));

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!name.trim() || !key.trim() || (status === "published" && !items.every((item) => isMenuItemComplete(item, defaultLocale)))) { setError(t("admin.menus.error.required")); return; }
    setIsSaving(true);
    try {
      const values = { name: name.trim(), key: key.trim(), status, defaultLocale, items };
      const saved = mode === "edit" && menuId ? await updateMenu({ id: menuId, ...values }) : await createMenu(values);
      setInitialSnapshot(JSON.stringify(values));
      router.replace(`/admin/menus/${saved.id}/edit`);
    } catch (caught) {
      setError(caught instanceof MenusApiError && caught.code === "DUPLICATE_KEY" ? t("admin.menus.error.duplicateKey") : caught instanceof MenusApiError && caught.code === "INVALID_KEY" ? t("admin.menus.error.invalidKey") : t("admin.menus.error.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <DataState variant="loading" title={t("admin.menus.loading")} />;
  if (loadError) return <DataState variant="error" description={t("admin.menus.error.loadFailed")} onAction={() => { setIsLoading(true); setLoadError(false); setReloadKey((value) => value + 1); }} />;
  return <AdminPage><form className="space-y-4" onSubmit={submit}>
    <div><h1 className="text-2xl font-semibold text-foreground">{mode === "edit" ? t("admin.menus.builder.editTitle") : t("admin.menus.builder.createTitle")}</h1><p className="mt-1 text-sm text-muted">{t("admin.menus.builder.description")}</p></div>
    <AdminFormAlert message={error} />
    <AdminCard title={t("admin.menus.builder.settings")}><div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2"><span className="block text-sm font-medium text-foreground">{t("admin.menus.form.name")}</span><Input required className="h-10 w-full" type="text" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block space-y-2"><span className="block text-sm font-medium text-foreground">{t("admin.menus.form.key")}</span><Input required className="h-10 w-full" type="text" value={key} onChange={(event) => setKey(event.target.value)} /></label><Select id="menu-status" label={t("admin.menus.form.status")} value={status} onChange={(event) => setStatus(event.target.value as T_MenuStatus)} options={[{ value: "draft", label: t("admin.menus.status.draft") }, { value: "published", label: t("admin.menus.status.published") }]} /><Select id="menu-default-locale" label={t("admin.menus.form.defaultLocale")} value={defaultLocale} onChange={(event) => setDefaultLocale(event.target.value as T_Locale)} options={locales.map((value) => ({ value, label: t(`language.${value}`) }))} /></div></AdminCard>
    <AdminCard title={t("admin.menus.builder.items")} description={t("admin.menus.builder.itemsDescription")}><div className="space-y-3">{items.map((item, index) => <MenuItemEditor key={item.id} item={item} defaultLocale={defaultLocale} depth={0} canMoveUp={index > 0} canMoveDown={index < items.length - 1} onMoveUp={() => move(index, -1)} onMoveDown={() => move(index, 1)} onChange={(next) => setItems((current) => current.map((value) => value.id === item.id ? next : value))} onDelete={() => setItems((current) => current.filter((value) => value.id !== item.id))} />)}<Button type="button" variant="secondary" className="inline-flex h-10 items-center whitespace-nowrap" onClick={() => setItems((current) => [...current, createItem()])}><Plus className="mr-2 h-4 w-4" />{t("admin.menus.actions.addItem")}</Button></div></AdminCard>
    {mode === "edit" && menuId && <MenuAssignments menuId={menuId} />}
    <AdminFormActions cancelLabel={t("admin.actions.cancel")} submitLabel={t("admin.actions.saveChanges")} submittingLabel={t("admin.form.saving")} isSubmitting={isSaving} isSticky onCancel={() => { if (!isDirty || window.confirm(t("admin.form.unsavedConfirmation"))) router.push("/admin/menus"); }} />
  </form></AdminPage>;
};
