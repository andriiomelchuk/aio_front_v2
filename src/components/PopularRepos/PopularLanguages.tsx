"use client";
import { useEffect, useState, useTransition } from "react";
import { T_Languages } from "./types";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { checkLanguageExists } from "@/lib/api";
import Loader from "@/shared/ui/Loader/Loader";
import { Input } from "@/shared/ui/Input/Input";
import { Button } from "@/shared/ui/Button";

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
      setError("This language is already in the list.");
      return;
    }

    const languageExists = await checkLanguageExists(trimmedLanguage);

    if (!languageExists) {
      setError("This language was not found on GitHub.");
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

  return (
    <>
      {isPending && <Loader />}
      <div className="flex flex-col items-center justify-start gap-4">
        <ul className="flex gap-4">
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
          className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 transition focus-within:border-accent"
          onSubmit={(e) => {
            e.preventDefault();
            addLanguage(language);
          }}
        >
          <Input
            variant="ghost"
            placeholder="Add language"
            onChange={(e) => setLanguage(e.target.value)}
            value={language}
          />
          <Button
            className="px-3 py-1.5 text-sm font-medium text-background transition hover:opacity-85 disable"
            disabled={!language.trim()}
          >
            Add
          </Button>
        </form>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>
    </>
  );
};
