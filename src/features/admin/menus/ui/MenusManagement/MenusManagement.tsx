"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { T_Menu } from "@/entities/menu";
import { useAdminAccess } from "@/features/auth";
import { deleteMenu, getMenus } from "@/shared/api/menus";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";

export const MenusManagement = () => {
  const { t } = useI18n(); const router = useRouter(); const { canManage } = useAdminAccess();
  const [menus, setMenus] = useState<T_Menu[]>([]); const [error, setError] = useState("");
  useEffect(() => { void getMenus().then(setMenus).catch(() => setError(t("admin.menus.error.loadFailed"))); }, [t]);
  const remove = async (menu: T_Menu) => { if (!window.confirm(t("admin.menus.deleteConfirmation", { name: menu.name }))) return; try { await deleteMenu(menu.id); setMenus((current) => current.filter((item) => item.id !== menu.id)); } catch { setError(t("admin.menus.error.deleteFailed")); } };
  return <AdminPage actions={canManage ? <Button onClick={() => router.push("/admin/menus/new")}>{t("admin.menus.actions.create")}</Button> : undefined}><AdminCard title={t("admin.menus.pageTitle")} description={t("admin.menus.description", { total: menus.length })}>
    {error && <p className="mb-4 rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger">{error}</p>}
    {menus.length === 0 ? <p className="py-8 text-center text-sm text-muted">{t("admin.menus.empty")}</p> : <div className="divide-y divide-border">{menus.map((menu) => <article key={menu.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><h2 className="font-semibold text-foreground">{menu.name}</h2><p className="mt-1 text-sm text-muted">{menu.key} · {t(`admin.menus.status.${menu.status}`)} · {t("admin.menus.itemCount", { count: menu.items.length })}</p></div>{canManage && <div className="flex gap-2"><Button variant="secondary" onClick={() => router.push(`/admin/menus/${menu.id}/edit`)}>{t("admin.menus.actions.edit")}</Button><Button variant="danger" onClick={() => void remove(menu)}>{t("admin.menus.actions.delete")}</Button></div>}</article>)}</div>}
  </AdminCard></AdminPage>;
};
