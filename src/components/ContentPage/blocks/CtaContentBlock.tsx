import Link from "next/link";
import { getLocalizedText, type T_ContentPageLocale, type T_CtaBlock } from "@/entities/contentPage";

const isSafeHref = (href: string) => href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://");

export const CtaContentBlock = ({ block, preview = false, locale, defaultLocale }: { block: T_CtaBlock; preview?: boolean; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const href = block.data.buttonHref?.trim();
  const title = getLocalizedText(block.data.title, locale, defaultLocale);
  const description = getLocalizedText(block.data.description, locale, defaultLocale);
  const buttonLabel = getLocalizedText(block.data.buttonLabel, locale, defaultLocale);

  return (
    <section className="bg-accent text-background">
      <div className={`mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 ${preview ? "py-8" : "py-10 sm:py-14"}`}>
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
          {description && <p className="mt-2 opacity-85">{description}</p>}
        </div>
        {buttonLabel && href && isSafeHref(href) && (
          <Link href={href} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-background px-5 font-semibold text-foreground transition hover:opacity-90">{buttonLabel}</Link>
        )}
      </div>
    </section>
  );
};
