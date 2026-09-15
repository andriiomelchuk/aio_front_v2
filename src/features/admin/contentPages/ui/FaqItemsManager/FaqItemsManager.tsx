import { Plus, Trash2 } from "lucide-react";
import { createLocalizedText, type T_ContentPageLocale, type T_FaqBlock } from "@/entities/contentPage";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { LocalizedField } from "../LocalizedField";

type T_FaqItem = T_FaqBlock["data"]["items"][number];

export const FaqItemsManager = ({ items, activeLocale, showValidationErrors, onChange }: { items: T_FaqItem[]; activeLocale: T_ContentPageLocale; showValidationErrors: boolean; onChange: (items: T_FaqItem[]) => void }) => {
  const { t } = useI18n();
  const updateItem = (id: string, changes: Partial<T_FaqItem>) =>
    onChange(items.map((item) => item.id === id ? { ...item, ...changes } : item));

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{t("admin.contentPages.block.faqItems")}</span>
        <Button type="button" variant="secondary" className="flex h-9 items-center gap-2 px-3" onClick={() => onChange([...items, { id: crypto.randomUUID(), question: createLocalizedText(), answer: createLocalizedText() }])}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          {t("admin.contentPages.collection.addQuestion")}
        </Button>
      </div>
      {items.length === 0 && <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted">{t("admin.contentPages.collection.noQuestions")}</p>}
      {items.map((item, index) => (
        <div key={item.id} className="grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <LocalizedField required showError={showValidationErrors} locale={activeLocale} label={t("admin.contentPages.collection.question", { number: index + 1 })} value={item.question} onChange={(question) => updateItem(item.id, { question })} />
            <LocalizedField required multiline showError={showValidationErrors} locale={activeLocale} label={t("admin.contentPages.collection.answer")} value={item.answer} onChange={(answer) => updateItem(item.id, { answer })} />
          </div>
          <Button type="button" variant="danger" className="flex h-10 w-10 items-center justify-center p-0 sm:mt-6" aria-label={t("admin.contentPages.collection.removeQuestion")} title={t("admin.contentPages.collection.removeQuestion")} onClick={() => onChange(items.filter((currentItem) => currentItem.id !== item.id))}>
            <Trash2 aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  );
};
