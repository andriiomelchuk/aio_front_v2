import { getLocalizedText, type T_ContentPageLocale, type T_GalleryBlock } from "@/entities/contentPage";
import { ManagedImage } from "@/shared/ui";

export const GalleryContentBlock = ({ block, preview = false, locale, defaultLocale }: { block: T_GalleryBlock; preview?: boolean; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const title = getLocalizedText(block.data.title, locale, defaultLocale);

  return (
  <section className="bg-background">
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${preview ? "py-8" : "py-10 sm:py-14"}`}>
      {title && <h2 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {block.data.images.filter((image) => image.url).map((image) => (
          <div key={image.id} className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface-muted">
            <ManagedImage fill src={image.url} alt={getLocalizedText(image.alt, locale, defaultLocale)} sizes="(max-width: 639px) 50vw, 25vw" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};
