import { Plus, Trash2 } from "lucide-react";
import { createLocalizedText, type T_ContentPageLocale, type T_GalleryBlock } from "@/entities/contentPage";
import { useI18n } from "@/shared/i18n";
import { Button, ImagePicker } from "@/shared/ui";
import { LocalizedField } from "../LocalizedField";

type T_GalleryImage = T_GalleryBlock["data"]["images"][number];

export const GalleryItemsManager = ({ images, activeLocale, showValidationErrors, onChange }: { images: T_GalleryImage[]; activeLocale: T_ContentPageLocale; showValidationErrors: boolean; onChange: (images: T_GalleryImage[]) => void }) => {
  const { t } = useI18n();
  const updateImage = (id: string, changes: Partial<T_GalleryImage>) =>
    onChange(images.map((image) => image.id === id ? { ...image, ...changes } : image));

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{t("admin.contentPages.block.galleryImages")}</span>
        <Button type="button" variant="secondary" className="flex h-9 items-center gap-2 px-3" onClick={() => onChange([...images, { id: crypto.randomUUID(), url: "", alt: createLocalizedText() }])}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          {t("admin.contentPages.collection.addImage")}
        </Button>
      </div>
      {images.length === 0 && <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted">{t("admin.contentPages.collection.noImages")}</p>}
      {images.map((image, index) => (
        <div key={image.id} className="grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid min-w-0 gap-3">
            <ImagePicker required label={t("admin.contentPages.collection.imageUrl", { number: index + 1 })} value={image.url} alt={image.alt.en} onChange={(url) => updateImage(image.id, { url })} />
            <LocalizedField required showError={showValidationErrors} locale={activeLocale} label={t("admin.contentPages.block.imageAlt")} value={image.alt} onChange={(alt) => updateImage(image.id, { alt })} />
          </div>
          <Button type="button" variant="danger" className="flex h-10 w-10 items-center justify-center p-0" aria-label={t("admin.contentPages.collection.removeImage")} title={t("admin.contentPages.collection.removeImage")} onClick={() => onChange(images.filter((item) => item.id !== image.id))}>
            <Trash2 aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  );
};
