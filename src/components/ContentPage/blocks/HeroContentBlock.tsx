import Link from "next/link";
import { getLocalizedText, type T_ContentPageLocale, type T_HeroBlock } from "@/entities/contentPage";
import { ManagedImage } from "@/shared/ui";

const isSafeHref = (href: string) =>
  href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://");

export const HeroContentBlock = ({
  block,
  preview = false,
  locale,
  defaultLocale,
}: {
  block: T_HeroBlock;
  preview?: boolean;
  locale: T_ContentPageLocale;
  defaultLocale: T_ContentPageLocale;
}) => {
  const buttonHref = block.data.buttonHref?.trim();
  const title = getLocalizedText(block.data.title, locale, defaultLocale);
  const description = getLocalizedText(block.data.description, locale, defaultLocale);
  const imageAlt = getLocalizedText(block.data.imageAlt, locale, defaultLocale);
  const buttonLabel = getLocalizedText(block.data.buttonLabel, locale, defaultLocale);

  return (
    <section className={`relative overflow-hidden bg-surface-muted ${preview ? "min-h-72" : "min-h-[420px] sm:min-h-[500px]"}`}>
      {block.data.imageUrl && (
        <>
          <ManagedImage
            fill
            priority
            src={block.data.imageUrl}
            alt={imageAlt}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        </>
      )}
      <div className={`relative mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8 ${preview ? "min-h-72 py-10" : "min-h-[420px] py-16 sm:min-h-[500px]"}`}>
        <div className={`max-w-3xl ${block.data.imageUrl ? "text-white" : "text-foreground"}`}>
          <h1 className={preview ? "text-3xl font-bold" : "text-4xl font-bold sm:text-5xl lg:text-6xl"}>{title}</h1>
          {description && (
            <p className={`mt-5 max-w-2xl text-base sm:text-lg ${block.data.imageUrl ? "text-white/85" : "text-muted"}`}>
              {description}
            </p>
          )}
          {buttonLabel && buttonHref && isSafeHref(buttonHref) && (
            <Link href={buttonHref} className="mt-7 inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-background transition hover:opacity-85">
              {buttonLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
