export const locales = ["uk", "en", "de", "ru"] as const;

export type T_Locale = (typeof locales)[number];

export type T_Dictionary = Record<string, string>;

export type T_I18nContext = {
  locale: T_Locale;
  setLocale: (locale: T_Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};