import type { T_I18nKey, T_Locale } from "@/shared/i18n";

export type T_LanguageSwitcherProps = {
  mode?: "select" | "buttons";
  variant?: "flag" | "compact" | "label";
};

export type T_LanguageOption = {
  locale: T_Locale;
  labelKey: T_I18nKey;
  shortLabel: string;
  flagSrc: string;
};
