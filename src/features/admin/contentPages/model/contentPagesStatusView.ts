import type { T_ContentPageStatus } from "@/entities/contentPage";
import type { T_I18nContext, T_I18nKey } from "@/shared/i18n";

export const contentPageStatusBadgeVariant: Record<
  T_ContentPageStatus,
  "success" | "warning" | "neutral"
> = {
  draft: "warning",
  published: "success",
  archived: "neutral",
};

const contentPageStatusLabelKey: Record<T_ContentPageStatus, T_I18nKey> = {
  draft: "admin.contentPages.status.draft",
  published: "admin.contentPages.status.published",
  archived: "admin.contentPages.status.archived",
};

export const getContentPageStatusLabel = (
  status: T_ContentPageStatus,
  t: T_I18nContext["t"],
) => t(contentPageStatusLabelKey[status]);
