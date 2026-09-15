import { useState } from "react";
import { contentPageLocales, type T_ContentPageLocale, type T_LocalizedText } from "@/entities/contentPage";
import { useI18n } from "@/shared/i18n";
import { Input, Select, Textarea } from "@/shared/ui";

type T_Props = {
  label: string;
  value: T_LocalizedText;
  multiline?: boolean;
  required?: boolean;
  showError?: boolean;
  locale: T_ContentPageLocale;
  onChange: (value: T_LocalizedText) => void;
};

export const LocalizedField = ({ label, value, multiline, required, showError, locale, onChange }: T_Props) => {
  const { t } = useI18n();
  const [selectedLocale, setSelectedLocale] = useState<T_ContentPageLocale>(locale);
  const updateLocale = (text: string) =>
    onChange({ ...value, [selectedLocale]: text });
  const error = showError && required && !value[locale].trim()
    ? `${t("admin.validation.required")} (${locale.toUpperCase()})`
    : undefined;

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <Select
          className="h-8 min-w-32 py-1"
          aria-label={t("admin.contentPages.form.contentLocale")}
          value={selectedLocale}
          onChange={(event) => setSelectedLocale(event.target.value as T_ContentPageLocale)}
          options={contentPageLocales.map((item) => ({
            value: item,
            label: `${item.toUpperCase()}${value[item].trim() ? " ✓" : ""}`,
          }))}
        />
      </div>
      {multiline ? (
        <Textarea error={error} aria-label={`${label} (${selectedLocale.toUpperCase()})`} aria-required={required} value={value[selectedLocale]} onChange={(event) => updateLocale(event.target.value)} />
      ) : (
        <Input error={error} aria-label={`${label} (${selectedLocale.toUpperCase()})`} aria-required={required} type="text" value={value[selectedLocale]} onChange={(event) => updateLocale(event.target.value)} />
      )}
    </div>
  );
};
