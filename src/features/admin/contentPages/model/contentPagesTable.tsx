import { getLocalizedText, type T_ContentPage, type T_ContentPageLocale } from "@/entities/contentPage";
import type { T_I18nContext } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { AdminBadge } from "@/widgets/AdminWidgets";
import {
  contentPageStatusBadgeVariant,
  getContentPageStatusLabel,
} from "./contentPagesStatusView";

export const getContentPagesColumns = (t: T_I18nContext["t"]) =>
  [
    { key: "title", label: t("admin.contentPages.table.title") },
    { key: "slug", label: t("admin.contentPages.table.slug") },
    {
      key: "status",
      label: t("admin.contentPages.table.status"),
      align: "center",
    },
    {
      key: "updatedAt",
      label: t("admin.contentPages.table.updatedAt"),
      align: "center",
    },
    {
      key: "actions",
      label: t("admin.contentPages.table.actions"),
      align: "right",
    },
  ] as const;

export const mapContentPagesRows = (
  pages: T_ContentPage[],
  t: T_I18nContext["t"],
  onEdit: (page: T_ContentPage) => void,
  onDelete: (page: T_ContentPage) => void,
  canManage: boolean,
  locale: T_ContentPageLocale,
) =>
  pages.map((page) => ({
    id: page.id,
    title: getLocalizedText(page.title, locale, page.defaultLocale),
    slug: `/${page.slug}`,
    status: (
      <AdminBadge variant={contentPageStatusBadgeVariant[page.status]}>
        {getContentPageStatusLabel(page.status, t)}
      </AdminBadge>
    ),
    updatedAt: new Date(page.updatedAt).toLocaleDateString(),
    actions: canManage ? (
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-3"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(page);
          }}
        >
          {t("admin.contentPages.actions.edit")}
        </Button>
        <Button
          type="button"
          variant="danger"
          className="h-9 px-3"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(page);
          }}
        >
          {t("admin.contentPages.actions.delete")}
        </Button>
      </div>
    ) : null,
  }));
