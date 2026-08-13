"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useI18n, type T_Locale } from "@/shared/i18n";
import type { T_LanguageOption, T_LanguageSwitcherProps } from "./types";

const languageOptions: T_LanguageOption[] = [
  {
    locale: "uk",
    labelKey: "language.uk",
    shortLabel: "UA",
    flagSrc: "/flags/ua.svg",
  },
  {
    locale: "en",
    labelKey: "language.en",
    shortLabel: "EN",
    flagSrc: "/flags/gb.svg",
  },
  {
    locale: "de",
    labelKey: "language.de",
    shortLabel: "DE",
    flagSrc: "/flags/de.svg",
  },
  {
    locale: "ru",
    labelKey: "language.ru",
    shortLabel: "RU",
    flagSrc: "/flags/ru.svg",
  },
];

export const LanguageSwitcher = ({
  mode = "select",
  variant = "compact",
}: T_LanguageSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const { locale, setLocale, t } = useI18n();

  const selectedLanguage =
    languageOptions.find((option) => option.locale === locale) ??
    languageOptions[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (!switcherRef.current) {
        return;
      }

      if (!switcherRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isOpen]);

  const getText = (option: T_LanguageOption) => {
    if (variant === "flag") {
      return null;
    }

    if (variant === "compact") {
      return option.shortLabel;
    }

    return t(option.labelKey);
  };

  const renderOptionContent = (option: T_LanguageOption) => {
    const text = getText(option);

    return (
      <>
        <Image
          src={option.flagSrc}
          alt={t(option.labelKey)}
          width={24}
          height={16}
          className="h-4 w-6 shrink-0 rounded-sm object-cover"
        />

        {text && <span>{text}</span>}
      </>
    );
  };

  const handleSelect = (nextLocale: T_Locale) => {
    setLocale(nextLocale);
    setIsOpen(false);
  };

  if (mode === "buttons") {
    return (
      <div
        className="inline-flex rounded-md border border-border bg-surface p-1"
        role="group"
        aria-label={t("language.switcherLabel")}
      >
        {languageOptions.map((option) => {
          const isActive = option.locale === locale;

          return (
            <button
              key={option.locale}
              type="button"
              onClick={() => setLocale(option.locale)}
              className={[
                "inline-flex h-8 items-center justify-center gap-1.5 rounded px-2 text-sm font-medium transition",
                isActive
                  ? "bg-accent text-background"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
                variant === "flag" ? "w-8 px-0" : "",
              ].join(" ")}
              aria-pressed={isActive}
              title={t(option.labelKey)}
            >
              {renderOptionContent(option)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={switcherRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={[
          "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground transition",
          "hover:bg-surface-muted ",
          variant === "flag"
            ? "w-16 justify-center px-2"
            : "min-w-24 justify-between",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("language.switcherLabel")}
      >
        <span className="inline-flex items-center gap-2">
          {renderOptionContent(selectedLanguage)}
        </span>

        <span className="shrink-0 text-xs text-muted">▼</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 min-w-36 overflow-hidden rounded-md border border-border bg-surface shadow-lg"
          role="listbox"
        >
          {languageOptions.map((option) => {
            const isActive = option.locale === locale;

            return (
              <button
                key={option.locale}
                type="button"
                onClick={() => handleSelect(option.locale)}
                className={[
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition",
                  isActive
                    ? "bg-accent text-background"
                    : "text-foreground hover:bg-surface-muted",
                ].join(" ")}
                role="option"
                aria-selected={isActive}
              >
                <Image
                  src={option.flagSrc}
                  alt={t(option.labelKey)}
                  width={24}
                  height={16}
                  className="h-4 w-6 shrink-0 rounded-sm object-cover"
                />

                <span>{t(option.labelKey)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
