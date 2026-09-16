import type { T_PageBlockType } from "@/entities/contentPage";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";

export const BlockLibrary = ({
  onAdd,
}: {
  onAdd: (type: T_PageBlockType) => void;
}) => {
  const { t } = useI18n();
  const types: T_PageBlockType[] = [
    "hero",
    "text",
    "image",
    "gallery",
    "products",
    "categories",
    "faq",
    "menu",
    "cta",
  ];

  return (
    <aside className="border-b border-border p-4 lg:border-r lg:border-b-0">
      <h2 className="text-sm font-semibold text-foreground">
        {t("admin.contentPages.builder.library")}
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {types.map((type) => (
          <Button
            key={type}
            type="button"
            variant="secondary"
            className="h-10 w-full text-left"
            onClick={() => onAdd(type)}
          >
            {t(`admin.contentPages.blocks.${type}`)}
          </Button>
        ))}
      </div>
    </aside>
  );
};
