import { getLocalizedText, type T_ContentPageLocale, type T_TextBlock } from "@/entities/contentPage";

const alignmentClasses = {
  left: "text-left",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
};

export const TextContentBlock = ({ block, preview = false, locale, defaultLocale }: { block: T_TextBlock; preview?: boolean; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const title = getLocalizedText(block.data.title, locale, defaultLocale);
  const content = getLocalizedText(block.data.content, locale, defaultLocale);

  return (
  <section className="w-full bg-background">
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${preview ? "py-8" : "py-10 sm:py-14"}`}>
      <div className={`max-w-4xl ${alignmentClasses[block.data.alignment]}`}>
        {title && (
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {title}
          </h2>
        )}
        <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-muted">
          {content}
        </p>
      </div>
    </div>
  </section>
  );
};
