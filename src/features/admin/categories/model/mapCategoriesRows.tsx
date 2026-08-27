import type { T_I18nContext } from "@/shared/i18n";
import type { T_Categories } from "@/entities/categories/model/types";
import { AdminBadge } from "@/widgets/AdminWidgets";
import { categoriesStatusBadgeVariant, getCategoriesStatusLabel } from "./categoriesStatusView";
import { Button } from "@/shared/ui";

export const mapCategoriesRows = (
  categories: T_Categories[],
  t: T_I18nContext["t"],
  onEdit: (category: T_Categories) => void,
) => {
  return categories.map((category) => ({
    id: category.id,
    orderId: `#${category.id}`,
    name: category.name,
    slug: category.slug,
    status: (
      <AdminBadge variant={categoriesStatusBadgeVariant[category.status]}>
        {getCategoriesStatusLabel(category.status, t)}
      </AdminBadge>
    ),
    action: (
      <Button
        className="h-10"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(category);
        }}
      >
        {t("admin.categories.table.editButton")}
      </Button>
    ),
  }));
};
