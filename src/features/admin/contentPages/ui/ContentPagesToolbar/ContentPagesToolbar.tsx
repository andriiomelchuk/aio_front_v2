import type { T_ContentPageStatus } from "@/entities/contentPage";
import { useI18n } from "@/shared/i18n";
import { Button, Input, Select } from "@/shared/ui";
import type { T_ContentPagesSort } from "../../model";
import type { T_ContentPagesToolbarProps } from "./types";

export const ContentPagesToolbar = ({
  controls,
  canManage,
  onCreate,
}: T_ContentPagesToolbarProps) => {
  const { t } = useI18n();

  return (
    <>
      <Input
        type="search"
        className="h-10 w-full sm:w-[220px]"
        value={controls.search}
        onChange={(event) => controls.setSearch(event.target.value)}
        placeholder={t("admin.contentPages.searchPlaceholder")}
      />
      <Select
        className="h-10 w-full sm:w-[180px]"
        value={controls.status}
        onChange={(event) =>
          controls.setStatus(
            event.target.value as T_ContentPageStatus | "all",
          )
        }
        options={[
          { value: "all", label: t("admin.contentPages.status.all") },
          { value: "draft", label: t("admin.contentPages.status.draft") },
          {
            value: "published",
            label: t("admin.contentPages.status.published"),
          },
          {
            value: "archived",
            label: t("admin.contentPages.status.archived"),
          },
        ]}
      />
      <Select
        className="h-10 w-full sm:w-[190px]"
        value={controls.sort}
        onChange={(event) =>
          controls.setSort(event.target.value as T_ContentPagesSort)
        }
        options={[
          {
            value: "updated-desc",
            label: t("admin.contentPages.sort.updatedDesc"),
          },
          { value: "title-asc", label: t("admin.contentPages.sort.titleAsc") },
          {
            value: "title-desc",
            label: t("admin.contentPages.sort.titleDesc"),
          },
        ]}
      />
      {controls.hasActiveControls && (
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full sm:w-auto"
          onClick={controls.resetControls}
        >
          {t("admin.actions.clearFilters")}
        </Button>
      )}
      {canManage && (
        <Button
          type="button"
          className="h-10 w-full sm:ml-auto sm:w-auto"
          onClick={onCreate}
        >
          {t("admin.contentPages.actions.add")}
        </Button>
      )}
    </>
  );
};
