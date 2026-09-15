"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { contentPageLocales, createLocalizedText, type T_ContentPageLocale, type T_ContentPageSeo, type T_ContentPageStatus, type T_LocalizedText, type T_PageBlock } from "@/entities/contentPage";
import { ContentPagesApiError, createContentPage, getContentPageById, updateContentPage } from "@/shared/api/contentPages";
import { useI18n } from "@/shared/i18n";
import { Button, Checkbox, Input, Select } from "@/shared/ui";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";
import { createPageBlock } from "../../model";
import { BlockLibrary } from "../BlockLibrary";
import { ContentPagePreview } from "../ContentPagePreview";
import { SortablePageBlock } from "../SortablePageBlock";
import { LocalizedField } from "../LocalizedField";
import type { T_ContentPageBuilderProps } from "./types";

const emptySeo = (): T_ContentPageSeo => ({ title: createLocalizedText(), description: createLocalizedText(), noIndex: true });

const isBlockComplete = (block: T_PageBlock, locale: T_ContentPageLocale) => {
    if (block.type === "hero") return Boolean(block.data.title[locale].trim());
    if (block.type === "text") return Boolean(block.data.content[locale].trim());
    if (block.type === "image") return Boolean(block.data.src.trim() && block.data.alt[locale].trim());
    if (block.type === "gallery") return block.data.images.length > 0 && block.data.images.every((image) => image.url.trim() && image.alt[locale].trim());
    if (block.type === "products") return block.data.productIds.length > 0;
    if (block.type === "categories") return block.data.categorySlugs.length > 0;
    if (block.type === "faq") return block.data.items.length > 0 && block.data.items.every((item) => item.question[locale].trim() && item.answer[locale].trim());
    if (block.type === "menu") return Boolean(block.data.menuId);
    return Boolean(block.data.title[locale].trim());
};

const isContentComplete = (title: T_LocalizedText, blocks: T_PageBlock[], locale: T_ContentPageLocale) =>
  Boolean(title[locale].trim()) && blocks.filter((block) => block.isVisible).every((block) => isBlockComplete(block, locale));

export const ContentPageBuilder = ({ mode, pageId }: T_ContentPageBuilderProps) => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<T_ContentPageStatus>("draft");
  const [defaultLocale, setDefaultLocale] = useState<T_ContentPageLocale>(locale);
  const [title, setTitle] = useState<T_LocalizedText>(() => createLocalizedText());
  const [blocks, setBlocks] = useState<T_PageBlock[]>([]);
  const [seo, setSeo] = useState<T_ContentPageSeo>(() => emptySeo());
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  useEffect(() => {
    if (mode !== "edit") return;
    const loadPage = async () => {
      try {
        const page = await getContentPageById(pageId);
        setSlug(page.slug);
        setStatus(page.status);
        setDefaultLocale(page.defaultLocale);
        setTitle(page.title);
        setBlocks(page.blocks);
        setSeo(page.seo);
      } catch {
        setError(t("admin.contentPages.error.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };
    void loadPage();
  }, [mode, pageId, t]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setBlocks((current) => {
      const oldIndex = current.findIndex((block) => block.id === active.id);
      const newIndex = current.findIndex((block) => block.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setShowValidationErrors(false);

    if (!title[defaultLocale].trim()) {
      setShowValidationErrors(true);
      setError(t("admin.contentPages.validation.defaultTitle"));
      return;
    }

    if (status === "published") {
      if (!isContentComplete(title, blocks, defaultLocale)) {
        setShowValidationErrors(true);
        setError(t("admin.contentPages.validation.translations", { locales: defaultLocale.toUpperCase() }));
        return;
      }
    }

    setIsSaving(true);
    try {
      const values = {
        slug: slug.trim(),
        status,
        defaultLocale,
        title,
        blocks,
        seo,
      };
      const savedPage = mode === "edit"
        ? await updateContentPage({ id: pageId, ...values })
        : await createContentPage(values);
      router.replace(`/admin/pages/${savedPage.id}/edit`);
    } catch (caughtError) {
      if (caughtError instanceof ContentPagesApiError) {
        if (caughtError.code === "DUPLICATE_SLUG") {
          setError(t("admin.contentPages.error.duplicateSlug"));
        } else if (caughtError.code === "RESERVED_SLUG") {
          setError(t("admin.contentPages.error.reservedSlug"));
        } else if (caughtError.code === "INVALID_SLUG") {
          setError(t("admin.contentPages.error.invalidSlug"));
        } else {
          setError(t("admin.contentPages.error.saveFailed"));
        }
      } else {
        setError(t("admin.contentPages.error.saveFailed"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="p-6 text-sm text-muted">{t("admin.contentPages.loading")}</p>;

  return (
    <AdminPage>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{mode === "edit" ? t("admin.contentPages.builder.editTitle") : t("admin.contentPages.builder.createTitle")}</h1>
            <p className="mt-1 text-sm text-muted">{t("admin.contentPages.builder.description")}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="h-10" onClick={() => router.push("/admin/pages")}>{t("admin.actions.cancel")}</Button>
            <Button type="submit" className="h-10" disabled={isSaving}>{isSaving ? t("admin.contentPages.actions.saving") : t("admin.actions.saveChanges")}</Button>
          </div>
        </div>

        {error && <p className="rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger">{error}</p>}

        <AdminCard title={t("admin.contentPages.builder.settings")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input required type="text" label={t("admin.contentPages.form.slug")} value={slug} onChange={(event) => setSlug(event.target.value)} />
            <Select label={t("admin.contentPages.form.status")} value={status} onChange={(event) => setStatus(event.target.value as T_ContentPageStatus)} options={[
              { value: "draft", label: t("admin.contentPages.status.draft") },
              { value: "published", label: t("admin.contentPages.status.published") },
              { value: "archived", label: t("admin.contentPages.status.archived") },
            ]} />
            <Select label={t("admin.contentPages.form.defaultLocale")} value={defaultLocale} onChange={(event) => {
              const nextLocale = event.target.value as T_ContentPageLocale;
              setDefaultLocale(nextLocale);
            }} options={contentPageLocales.map((item) => ({ value: item, label: t(`language.${item}`) }))} />
          </div>
        </AdminCard>

        <AdminCard title={t("admin.contentPages.form.localizedContent", { locale: t(`language.${defaultLocale}`) })}>
          <div className="grid gap-4 sm:grid-cols-2">
            <LocalizedField required showError={showValidationErrors} locale={defaultLocale} label={t("admin.contentPages.form.title")} value={title} onChange={setTitle} />
            <LocalizedField locale={defaultLocale} label={t("admin.contentPages.form.seoTitle")} value={seo.title} onChange={(seoTitle) => setSeo((current) => ({ ...current, title: seoTitle }))} />
            <LocalizedField multiline locale={defaultLocale} label={t("admin.contentPages.form.seoDescription")} value={seo.description} onChange={(description) => setSeo((current) => ({ ...current, description }))} />
            <Checkbox className="sm:col-span-2" label={t("admin.contentPages.form.noIndex")} description={t("admin.contentPages.form.noIndexDescription")} checked={seo.noIndex} onChange={(event) => setSeo((current) => ({ ...current, noIndex: event.target.checked }))} />
          </div>
        </AdminCard>

        <div className="overflow-hidden rounded-md border border-border bg-background lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <BlockLibrary onAdd={(type) => setBlocks((current) => [...current, createPageBlock(type)])} />
          <div className="min-w-0 space-y-3 p-4">
            {blocks.length === 0 ? <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">{t("admin.contentPages.builder.empty")}</div> : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">{blocks.map((block) => (
                    <SortablePageBlock key={block.id} block={block}
                      activeLocale={defaultLocale}
                      showValidationErrors={showValidationErrors}
                      hasValidationError={!isBlockComplete(block, defaultLocale)}
                      onChange={(updatedBlock) => setBlocks((current) => current.map((item) => item.id === updatedBlock.id ? updatedBlock : item))}
                      onDuplicate={() => setBlocks((current) => { const index = current.findIndex((item) => item.id === block.id); const duplicate = { ...structuredClone(block), id: crypto.randomUUID() }; return [...current.slice(0, index + 1), duplicate, ...current.slice(index + 1)]; })}
                      onDelete={() => setBlocks((current) => current.filter((item) => item.id !== block.id))}
                    />
                  ))}</div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <ContentPagePreview blocks={blocks} locale={locale} defaultLocale={defaultLocale} />
      </form>
    </AdminPage>
  );
};
