import { getLocalizedText, type T_ContentPageLocale, type T_FaqBlock } from "@/entities/contentPage";

export const FaqContentBlock = ({ block, preview = false, locale, defaultLocale }: { block: T_FaqBlock; preview?: boolean; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const title = getLocalizedText(block.data.title, locale, defaultLocale);

  return (
  <section className="bg-background">
    <div className={`mx-auto max-w-4xl px-4 sm:px-6 ${preview ? "py-8" : "py-10 sm:py-14"}`}>
      {title && <h2 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>}
      <div className="divide-y divide-border border-y border-border">
        {block.data.items.map((item) => (
          <details key={item.id} className="group py-4">
            <summary className="cursor-pointer list-none font-medium text-foreground">{getLocalizedText(item.question, locale, defaultLocale)}</summary>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-muted">{getLocalizedText(item.answer, locale, defaultLocale)}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
  );
};
