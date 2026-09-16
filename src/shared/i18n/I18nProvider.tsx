"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { dictionaries } from "./dictionaries";
import {
  getPublishedTranslationOverrides,
  getTranslationStorageSnapshot,
  TRANSLATIONS_CHANGE_EVENT,
} from "@/shared/api/translations";
import { locales, type T_I18nContext, type T_Locale } from "./types";

const DEFAULT_LOCALE: T_Locale = "uk";
const STORAGE_KEY = "aio-locale";

const I18nContext = createContext<T_I18nContext | null>(null);

const isLocale = (value: string | null): value is T_Locale => {
  return Boolean(value && locales.includes(value as T_Locale));
};

const formatMessage = (
  message: string,
  params?: Record<string, string | number>,
) => {
  if (!params) {
    return message;
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, message);
};

const getStoredLocale = (): T_Locale => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const savedLocale = window.localStorage.getItem(STORAGE_KEY);

  return isLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE;
};

const subscribeToLocale = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("aio-locale-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("aio-locale-change", callback);
  };
};

const subscribeToTranslations = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(TRANSLATIONS_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(TRANSLATIONS_CHANGE_EVENT, callback);
  };
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getStoredLocale,
    () => DEFAULT_LOCALE,
  );
  const translationSnapshot = useSyncExternalStore(
    subscribeToTranslations,
    getTranslationStorageSnapshot,
    () => "",
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale: T_Locale) => {
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
    window.dispatchEvent(new Event("aio-locale-change"));
  };

  const value = useMemo<T_I18nContext>(() => {
    const dictionary = {
      ...dictionaries[locale],
      ...(translationSnapshot ? getPublishedTranslationOverrides(locale) : {}),
    };

    return {
      locale,
      setLocale,
      t: (key, params) => {
        const message = dictionary[key] ?? key;

        return formatMessage(message, params);
      },
    };
  }, [locale, translationSnapshot]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
};
