"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLocalizedText, type T_ContentPage } from "@/entities/contentPage";
import { useAdminAccess } from "@/features/auth";
import { paginate } from "@/lib";
import {
  deleteContentPage,
  duplicateContentPage,
  getContentPages,
} from "@/shared/api/contentPages";
import { useI18n } from "@/shared/i18n";
import { DataState, Pagination } from "@/shared/ui";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import {
  filterContentPages,
  getContentPagesColumns,
  mapContentPagesRows,
  sortContentPages,
  useContentPagesTableControls,
} from "../../model";
import { ContentPagesToolbar } from "../ContentPagesToolbar";

export const ContentPagesManagement = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { canManage } = useAdminAccess();
  const controls = useContentPagesTableControls();
  const [pages, setPages] = useState<T_ContentPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadPages = async () => {
      setIsLoading(true);
      setError("");
      try {
        setPages(await getContentPages());
      } catch {
        setError(t("admin.contentPages.error.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPages();
  }, [reloadKey, t]);

  const filteredPages = filterContentPages(pages, {
    search: controls.search,
    status: controls.status,
  });
  const sortedPages = sortContentPages(filteredPages, controls.sort, locale);
  const paginatedPages = paginate(
    sortedPages,
    controls.page,
    controls.pageSize,
  );

  const handleDelete = async (page: T_ContentPage) => {
    if (!window.confirm(t("admin.contentPages.deleteConfirmation", { title: getLocalizedText(page.title, locale, page.defaultLocale) }))) {
      return;
    }

    try {
      await deleteContentPage(page.id);
      setPages((currentPages) =>
        currentPages.filter((currentPage) => currentPage.id !== page.id),
      );
      setError("");
    } catch {
      setError(t("admin.contentPages.error.deleteFailed"));
    }
  };

  const handleDuplicate = async (page: T_ContentPage) => {
    try {
      const duplicate = await duplicateContentPage(page.id);
      router.push(`/admin/pages/${duplicate.id}/edit`);
    } catch {
      setError(t("admin.contentPages.error.duplicateFailed"));
    }
  };

  const rows = mapContentPagesRows(
    paginatedPages,
    t,
    (page) => router.push(`/admin/pages/${page.id}/edit`),
    (page) => void handleDuplicate(page),
    (page) => void handleDelete(page),
    canManage,
    locale,
  );

  return (
    <AdminPage
      actions={
        <ContentPagesToolbar
          controls={controls}
          canManage={canManage}
          onCreate={() => router.push("/admin/pages/new")}
        />
      }
    >
      <AdminCard
        title={t("admin.contentPages.pageTitle")}
        description={t("admin.contentPages.description", {
          shown: paginatedPages.length,
          total: filteredPages.length,
        })}
      >
        {isLoading ? <DataState compact variant="loading" title={t("admin.contentPages.loading")} /> : error ? <DataState compact variant="error" description={error} onAction={() => setReloadKey((value) => value + 1)} /> : rows.length === 0 ? <DataState compact variant="empty" title={t("admin.contentPages.notFound")} /> : <AdminTable
          columns={getContentPagesColumns(t)}
          rows={rows}
          getRowKey={(row) => row.id}
          onRowClick={canManage ? (row) => {
            const page = pages.find((item) => item.id === row.id);
            if (page) router.push(`/admin/pages/${page.id}/edit`);
          } : undefined}
        />}

        <Pagination
          page={controls.page}
          pageSize={controls.pageSize}
          totalItems={sortedPages.length}
          onPageChange={controls.setPage}
          onPageSizeChange={controls.setPageSize}
        />
      </AdminCard>

    </AdminPage>
  );
};
