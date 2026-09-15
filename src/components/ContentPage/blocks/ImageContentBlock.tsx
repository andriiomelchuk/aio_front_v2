import { getLocalizedText, type T_ContentPageLocale, type T_ImageBlock } from "@/entities/contentPage";
import { ManagedImage } from "@/shared/ui";

export const ImageContentBlock = ({ block, preview = false, locale, defaultLocale }: { block: T_ImageBlock; preview?: boolean; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const alt = getLocalizedText(block.data.alt, locale, defaultLocale);
  const caption = getLocalizedText(block.data.caption, locale, defaultLocale);

  return (
  <section className="w-full bg-surface">
    <figure className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${preview ? "py-8" : "py-10 sm:py-14"}`}>
      <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-border bg-surface-muted">
        <ManagedImage
          fill
          src={block.data.src}
          alt={alt}
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  </section>
  );
};
