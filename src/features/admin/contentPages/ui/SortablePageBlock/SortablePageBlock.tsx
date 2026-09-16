import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { T_ContentPageLocale, T_PageBlock } from "@/entities/contentPage";
import { useI18n } from "@/shared/i18n";
import { Button, Checkbox, ImagePicker, Input, Select } from "@/shared/ui";
import { ContentReferenceSelector } from "../ContentReferenceSelector";
import { FaqItemsManager } from "../FaqItemsManager";
import { GalleryItemsManager } from "../GalleryItemsManager";
import { LocalizedField } from "../LocalizedField";
import { MenuBlockEditor } from "../MenuBlockEditor";

type T_Props = {
  block: T_PageBlock;
  onChange: (block: T_PageBlock) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  activeLocale: T_ContentPageLocale;
  showValidationErrors: boolean;
  hasValidationError: boolean;
};

export const SortablePageBlock = ({ block, activeLocale, showValidationErrors, hasValidationError, onChange, onDuplicate, onDelete }: T_Props) => {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`rounded-md border border-border bg-surface ${isDragging ? "z-10 opacity-70 shadow-lg" : ""}`}
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          className="flex h-9 w-9 cursor-grab items-center justify-center rounded-md border border-border text-xl text-muted active:cursor-grabbing"
          aria-label={t("admin.contentPages.builder.dragBlock")}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <h3 className="font-semibold text-foreground">
          {t(`admin.contentPages.blocks.${block.type}`)}
        </h3>
        <Button type="button" variant="secondary" className="ml-auto h-9 px-3" onClick={onDuplicate}>
          {t("admin.contentPages.actions.duplicate")}
        </Button>
        <Button
          type="button"
          variant="danger"
          className="h-9 px-3"
          onClick={onDelete}
        >
          {t("admin.contentPages.actions.delete")}
        </Button>
      </header>

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {showValidationErrors && hasValidationError && (
          <p className="rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger sm:col-span-2">
            {t("admin.contentPages.validation.translations", { locales: activeLocale.toUpperCase() })}
          </p>
        )}
        {block.type === "hero" && (
          <>
            <LocalizedField required showError={showValidationErrors} locale={activeLocale} label={t("admin.contentPages.block.title")} value={block.data.title} onChange={(title) => onChange({ ...block, data: { ...block.data, title } })} />
            <ImagePicker label={t("admin.contentPages.block.imageUrl")} value={block.data.imageUrl} alt={block.data.imageAlt.en} onChange={(imageUrl) => onChange({ ...block, data: { ...block.data, imageUrl } })} />
            <LocalizedField multiline locale={activeLocale} label={t("admin.contentPages.block.description")} value={block.data.description} onChange={(description) => onChange({ ...block, data: { ...block.data, description } })} />
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.imageAlt")} value={block.data.imageAlt} onChange={(imageAlt) => onChange({ ...block, data: { ...block.data, imageAlt } })} />
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.buttonLabel")} value={block.data.buttonLabel} onChange={(buttonLabel) => onChange({ ...block, data: { ...block.data, buttonLabel } })} />
            <Input type="text" label={t("admin.contentPages.block.buttonHref")} value={block.data.buttonHref ?? ""} onChange={(event) => onChange({ ...block, data: { ...block.data, buttonHref: event.target.value } })} />
          </>
        )}

        {block.type === "text" && (
          <>
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.title")} value={block.data.title} onChange={(title) => onChange({ ...block, data: { ...block.data, title } })} />
            <Select label={t("admin.contentPages.block.alignment")} value={block.data.alignment} onChange={(event) => onChange({ ...block, data: { ...block.data, alignment: event.target.value as "left" | "center" | "right" } })} options={[
              { value: "left", label: t("admin.contentPages.block.alignLeft") },
              { value: "center", label: t("admin.contentPages.block.alignCenter") },
              { value: "right", label: t("admin.contentPages.block.alignRight") },
            ]} />
            <LocalizedField required multiline showError={showValidationErrors} locale={activeLocale} label={t("admin.contentPages.block.content")} value={block.data.content} onChange={(content) => onChange({ ...block, data: { ...block.data, content } })} />
          </>
        )}

        {block.type === "image" && (
          <>
            <ImagePicker required label={t("admin.contentPages.block.imageUrl")} value={block.data.src} alt={block.data.alt.en} onChange={(src) => onChange({ ...block, data: { ...block.data, src } })} />
            <LocalizedField required showError={showValidationErrors} locale={activeLocale} label={t("admin.contentPages.block.imageAlt")} value={block.data.alt} onChange={(alt) => onChange({ ...block, data: { ...block.data, alt } })} />
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.caption")} value={block.data.caption} onChange={(caption) => onChange({ ...block, data: { ...block.data, caption } })} />
          </>
        )}

        {block.type === "gallery" && (
          <>
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.title")} value={block.data.title} onChange={(title) => onChange({ ...block, data: { ...block.data, title } })} />
            <GalleryItemsManager activeLocale={activeLocale} showValidationErrors={showValidationErrors} images={block.data.images} onChange={(images) => onChange({ ...block, data: { ...block.data, images } })} />
          </>
        )}

        {block.type === "products" && (
          <>
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.title")} value={block.data.title} onChange={(title) => onChange({ ...block, data: { ...block.data, title } })} />
            <ContentReferenceSelector type="products" selectedValues={block.data.productIds} onChange={(productIds) => onChange({ ...block, data: { ...block.data, productIds } })} />
          </>
        )}

        {block.type === "categories" && (
          <>
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.title")} value={block.data.title} onChange={(title) => onChange({ ...block, data: { ...block.data, title } })} />
            <ContentReferenceSelector type="categories" selectedValues={block.data.categorySlugs} onChange={(categorySlugs) => onChange({ ...block, data: { ...block.data, categorySlugs } })} />
          </>
        )}

        {block.type === "faq" && (
          <>
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.title")} value={block.data.title} onChange={(title) => onChange({ ...block, data: { ...block.data, title } })} />
            <FaqItemsManager activeLocale={activeLocale} showValidationErrors={showValidationErrors} items={block.data.items} onChange={(items) => onChange({ ...block, data: { ...block.data, items } })} />
          </>
        )}

        {block.type === "menu" && <MenuBlockEditor block={block} activeLocale={activeLocale} onChange={onChange} />}

        {block.type === "cta" && (
          <>
            <LocalizedField required showError={showValidationErrors} locale={activeLocale} label={t("admin.contentPages.block.title")} value={block.data.title} onChange={(title) => onChange({ ...block, data: { ...block.data, title } })} />
            <LocalizedField locale={activeLocale} label={t("admin.contentPages.block.buttonLabel")} value={block.data.buttonLabel} onChange={(buttonLabel) => onChange({ ...block, data: { ...block.data, buttonLabel } })} />
            <LocalizedField multiline locale={activeLocale} label={t("admin.contentPages.block.description")} value={block.data.description} onChange={(description) => onChange({ ...block, data: { ...block.data, description } })} />
            <Input type="text" label={t("admin.contentPages.block.buttonHref")} value={block.data.buttonHref ?? ""} onChange={(event) => onChange({ ...block, data: { ...block.data, buttonHref: event.target.value } })} />
          </>
        )}

        <Checkbox
          className="sm:col-span-2"
          label={t("admin.contentPages.block.visible")}
          description={t("admin.contentPages.block.visibleDescription")}
          checked={block.isVisible}
          onChange={(event) => onChange({ ...block, isVisible: event.target.checked })}
        />
      </div>
    </section>
  );
};
