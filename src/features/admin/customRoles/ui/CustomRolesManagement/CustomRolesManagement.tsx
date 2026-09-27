"use client";

import { useEffect, useState } from "react";
import { Archive, Copy, Plus, RotateCcw, Save } from "lucide-react";
import { createEmptyCustomRole, customRoleActions, type T_CustomRole, type T_CustomRoleAction, type T_SaveCustomRoleDto } from "@/entities/customRole";
import { useAdminAccess } from "@/features/auth";
import { getCustomRoleAuditSync, getCustomRoles, saveCustomRole, setCustomRoleStatus } from "@/shared/api/customRoles";
import { adminModules, type T_AdminModule } from "@/shared/config/adminModules";
import { locales, useI18n, type T_Locale } from "@/shared/i18n";
import { Button, Checkbox, Input, Select, Switch, Textarea } from "@/shared/ui";
import { AdminCard, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";

const modules = Object.keys(adminModules) as T_AdminModule[];
const csv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export const CustomRolesManagement = () => {
  const { t, locale } = useI18n();
  const { role: actorRole } = useAdminAccess();
  const [roles, setRoles] = useState<T_CustomRole[]>([]);
  const [draft, setDraft] = useState<T_SaveCustomRoleDto>(createEmptyCustomRole);
  const [editingLocale, setEditingLocale] = useState<T_Locale>(locale);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const audit = getCustomRoleAuditSync().filter((entry) => !draft.id || entry.roleId === draft.id).slice(0, 10);
  const load = () => void getCustomRoles().then(setRoles);
  useEffect(load, []);

  const updateTranslation = (field: "name" | "description", value: string) => setDraft((current) => ({ ...current, translations: { ...current.translations, [editingLocale]: { ...current.translations[editingLocale], [field]: value } } }));
  const togglePermission = (module: T_AdminModule, action: T_CustomRoleAction, enabled: boolean) => setDraft((current) => {
    const actions = current.permissions[module] ?? [];
    return { ...current, permissions: { ...current.permissions, [module]: enabled ? [...new Set([...actions, action])] : actions.filter((item) => item !== action) } };
  });
  const save = async () => {
    if (!actorRole) return;
    setError(""); setMessage("");
    try { const saved = await saveCustomRole(draft, actorRole); setDraft(saved); load(); setMessage(t("admin.roles.saved")); }
    catch (caught) { setError(caught instanceof Error ? caught.message : t("admin.roles.error")); }
  };
  const changeStatus = async () => {
    if (!draft.id || !actorRole) return;
    const saved = await setCustomRoleStatus(draft.id, draft.status === "active" ? "archived" : "active", actorRole);
    setDraft(saved); load();
  };
  const duplicate = () => setDraft((current) => ({ ...structuredClone(current), id: undefined, key: `${current.key}-copy`, status: "active", translations: Object.fromEntries(locales.map((item) => [item, { ...current.translations[item], name: `${current.translations[item].name} copy` }])) as T_SaveCustomRoleDto["translations"] }));

  return <AdminPage title={t("admin.roles.title")} description={t("admin.roles.description")} actions={<>
    <Button variant="secondary" className="inline-flex items-center gap-2" onClick={() => setDraft(createEmptyCustomRole())}><Plus size={17} />{t("admin.roles.new")}</Button>
    {draft.id && <Button variant="secondary" className="inline-flex items-center gap-2" onClick={duplicate}><Copy size={17} />{t("admin.roles.duplicate")}</Button>}
    {draft.id && <Button variant="secondary" className="inline-flex items-center gap-2" onClick={() => void changeStatus()}>{draft.status === "active" ? <Archive size={17} /> : <RotateCcw size={17} />}{draft.status === "active" ? t("admin.roles.archive") : t("admin.roles.restore")}</Button>}
    <Button className="inline-flex items-center gap-2" onClick={() => void save()}><Save size={17} />{t("admin.roles.save")}</Button>
  </>}>
    <div className="space-y-4"><AdminFormAlert message={error} />{message && <p role="status" className="border border-accent bg-accent/10 p-3 text-sm">{message}</p>}
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <AdminCard title={t("admin.roles.list")} description={t("admin.roles.systemProtected")}><div className="space-y-2">{roles.map((item) => <button key={item.id} type="button" onClick={() => setDraft(structuredClone(item))} className={`w-full border p-3 text-left ${draft.id === item.id ? "border-accent bg-accent/10" : "border-border"}`}><strong className="block">{item.translations[locale].name || item.translations.uk.name}</strong><span className="text-xs text-muted">{item.key} / {t(`admin.roles.status.${item.status}`)}</span></button>)}{!roles.length && <p className="text-sm text-muted">{t("admin.roles.empty")}</p>}</div></AdminCard>
        <div className="space-y-4">
          <AdminCard title={t("admin.roles.identity")}><div className="grid gap-4 sm:grid-cols-2"><Input label={t("admin.roles.key")} value={draft.key} disabled={Boolean(draft.id)} onChange={(event) => setDraft((current) => ({ ...current, key: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} /><Select label={t("admin.roles.language")} value={editingLocale} onChange={(event) => setEditingLocale(event.target.value as T_Locale)} options={locales.map((item) => ({ value: item, label: item.toUpperCase() }))} /><Input label={t("admin.roles.name")} value={draft.translations[editingLocale].name} onChange={(event) => updateTranslation("name", event.target.value)} /><Textarea label={t("admin.roles.roleDescription")} value={draft.translations[editingLocale].description} onChange={(event) => updateTranslation("description", event.target.value)} /></div></AdminCard>
          <AdminCard title={t("admin.roles.permissions")} description={t("admin.roles.denyByDefault")}><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="p-2">{t("admin.roles.module")}</th>{customRoleActions.map((action) => <th key={action} className="p-2 text-center">{t(`admin.roles.action.${action}`)}</th>)}</tr></thead><tbody>{modules.filter((module) => module !== "developerSettings" && module !== "roles").map((module) => <tr key={module} className="border-b border-border"><th className="p-2 font-medium">{module}</th>{customRoleActions.map((action) => <td key={action} className="p-2 text-center"><Checkbox aria-label={`${module} ${action}`} checked={draft.permissions[module]?.includes(action) ?? false} onChange={(event) => togglePermission(module, action, event.target.checked)} /></td>)}</tr>)}</tbody></table></div></AdminCard>
          <AdminCard title={t("admin.roles.restrictions")}><div className="grid gap-4 md:grid-cols-3"><Input label={t("admin.roles.branches")} value={draft.restrictions.branches.join(", ")} onChange={(event) => setDraft((current) => ({ ...current, restrictions: { ...current.restrictions, branches: csv(event.target.value) } }))} /><Input label={t("admin.roles.warehouses")} value={draft.restrictions.warehouses.join(", ")} onChange={(event) => setDraft((current) => ({ ...current, restrictions: { ...current.restrictions, warehouses: csv(event.target.value) } }))} /><Input label={t("admin.roles.serviceCategories")} value={draft.restrictions.serviceCategories.join(", ")} onChange={(event) => setDraft((current) => ({ ...current, restrictions: { ...current.restrictions, serviceCategories: csv(event.target.value) } }))} /></div><div className="mt-4"><Switch label={t("admin.roles.ownRecords")} checked={draft.restrictions.ownRecordsOnly} onChange={(event) => setDraft((current) => ({ ...current, restrictions: { ...current.restrictions, ownRecordsOnly: event.target.checked } }))} /></div></AdminCard>
          <AdminCard title={t("admin.roles.preview")}><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{modules.map((module) => <div key={module} className="border border-border p-3"><strong className="text-sm">{module}</strong><p className="mt-1 text-xs text-muted">{draft.permissions[module]?.join(", ") || t("admin.roles.noAccess")}</p></div>)}</div></AdminCard>
          <AdminCard title={t("admin.roles.audit")}><div className="space-y-2">{audit.map((entry) => <p key={entry.id} className="border-b border-border pb-2 text-sm"><strong>{entry.action}</strong> / {entry.actorRole}<span className="block text-xs text-muted">{new Date(entry.createdAt).toLocaleString()}</span></p>)}{!audit.length && <p className="text-sm text-muted">{t("admin.roles.auditEmpty")}</p>}</div></AdminCard>
        </div>
      </div>
    </div>
  </AdminPage>;
};
