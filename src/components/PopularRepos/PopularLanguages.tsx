"use client";
import { useEffect, useState, useTransition } from "react";
import type { T_Languages } from "./types";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import Loader from "@/shared/ui/Loader/Loader";
import { Input } from "@/shared/ui/Input/Input";
import { Button } from "@/shared/ui/Button";
import { checkLanguageExists } from "@/lib/github";
import { useI18n } from "@/shared/i18n";

const STORAGE_KEY = "popularLanguages";

const defaultLanguages: T_Languages[] = [
  { id: "all", name: "All" },
  { id: "javascript", name: "JavaScript" },
  { id: "ruby", name: "Ruby" },
  { id: "java", name: "Java" },
  { id: "css", name: "CSS" },
  { id: "python", name: "Python" },
];

const getInitialLanguages = () => {
  if (typeof window === "undefined") {
    return defaultLanguages;
  }

  const savedLanguages = sessionStorage.getItem(STORAGE_KEY);

  if (!savedLanguages) {
    return defaultLanguages;
  }

  try {
    return JSON.parse(savedLanguages) as T_Languages[];
  } catch {
    return defaultLanguages;
  }
};

export const PopularLanguages = () => {
  const [languages, setLanguages] =
    useState<T_Languages[]>(getInitialLanguages);

  const [language, setLanguage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLanguage = searchParams.get("language") ?? "all";
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(languages));
  }, [languages]);

  const addLanguage = async (row: string) => {
    const trimmedLanguage = row.trim();

    setError(null);

    if (!trimmedLanguage) {
      return;
    }

    const exists = languages.some(
      (item) => item.id === trimmedLanguage.toLowerCase(),
    );

    if (exists) {
      setError(t("popular.languageAlreadyExists"));
      return;
    }

    const languageExists = await checkLanguageExists(trimmedLanguage);

    if (!languageExists) {
      setError(t("popular.languageNotFound"));
      return;
    }

    const newLanguage = {
      id: trimmedLanguage.toLowerCase(),
      name: trimmedLanguage,
    };

    setLanguages([...languages, newLanguage]);
    setLanguage("");
    setError(null);
  };

  const setLanguageParam = (lang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("language", lang);
    startTransition(() => {
      router.push(`/popular?${params.toString()}`);
    });
  };

  const deleteCurrentLang = (currentLang: string) => {
    const normalizedLang = currentLang.toLowerCase();

    setLanguages(
      languages.filter((item) => {
        return item.id !== normalizedLang;
      }),
    );
    if (currentLanguage === normalizedLang) {
      startTransition(() => {
        router.push("/popular?language=all");
      });
    }
  };

  const { t } = useI18n();

  return (
    <>
      {isPending && <Loader />}
      <div className="flex flex-col items-center justify-start gap-4">
        <ul className="flex flex-wrap justify-center gap-3">
          {languages.map((lang) => {
            const isActive = currentLanguage === lang.id;
            return (
              <li key={lang.id} className="relative">
                <div
                  className={`flex h-9 items-center rounded-full border transition ${
                    isActive
                      ? "border-accent bg-accent-soft text-foreground"
                      : "border-border bg-surface text-muted hover:border-accent"
                  }`}
                >
                  <Button
                    onClick={() => setLanguageParam(lang.id)}
                    variant="invisible"
                    type="submit"
                    className={`h-full px-4 text-sm transition hover:text-foreground ${
                      isActive
                        ? "border-accent bg-accent-soft text-foreground"
                        : "border-border bg-surface text-muted hover:border-accent"
                    }`}
                  >
                    {lang.name}
                  </Button>

                  {languages.length > 6 && lang.id !== "all" && (
                    <Button
                      variant="invisible"
                      onClick={() => deleteCurrentLang(lang.id)}
                      className="mr-2 flex size-5 shrink-0 items-center justify-center rounded-full! p-0! text-xs text-muted hover:bg-danger hover:text-background"
                      title={t("popular.deleteLanguage")}
                    >
                      X
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="flex w-full max-w-sm flex-col gap-2 rounded-md border border-border bg-surface p-2 transition focus-within:border-accent sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            addLanguage(language);
          }}
        >
          <div className="min-w-0 flex-1">
            <Input
              variant="ghost"
              type="text"
              placeholder={t("popular.buttonPlaceholder")}
              onChange={(e) => setLanguage(e.target.value)}
              value={language}
              className="h-10 w-full"
            />
          </div>

          <Button
            type="submit"
            className="h-10 w-full shrink-0 px-4 text-sm font-medium text-background transition hover:opacity-85 sm:w-auto"
            disabled={!language.trim()}
          >
            {t("popular.addButton")}
          </Button>
        </form>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>
    </>
  );
};
