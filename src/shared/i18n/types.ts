import { en } from "./dictionaries/en";

export const locales = ["uk", "en", "de", "ru"] as const;

export type T_Locale = (typeof locales)[number];

export type T_Dictionary = Record<string, string>;

export type T_I18nKey = keyof typeof en;

export type T_I18nContext = {
  locale: T_Locale;
  setLocale: (locale: T_Locale) => void;
  t: (
    key: T_I18nKey,
    params?: Record<string, string | number>,
  ) => string;
};

// export type T_I18nContext = {
//   locale: T_Locale;
//   setLocale: (locale: T_Locale) => void;
//   t: (key: string, params?: Record<string, string | number>) => string;
// };