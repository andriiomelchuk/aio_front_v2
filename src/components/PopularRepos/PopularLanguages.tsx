"use client";
import { useEffect, useState, useTransition } from "react";
import { T_Languages } from "./types";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { checkLanguageExists } from "@/lib/api";
import Loader from "@/shared/ui/Loader/Loader";

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
  const [languages, setLanguages] = useState<T_Languages[]>(getInitialLanguages);

  const [language, setLanguage] = useState<string>("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLanguage = searchParams.get("language") ?? "all";

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(languages));
  }, [languages]);

  const addLanguage = async (row: string) => {
    const exists = languages.some((item) => item.id === row.toLowerCase());

    if (exists) {
      return;
    }

    const languageExists = await checkLanguageExists(row);

    if (!languageExists) {
      console.log("That language isn't available on GitHub");
      return;
    }

    const newLanguage = {
      id: row.toLowerCase(),
      name: row,
    };

    setLanguages([...languages, newLanguage]);
    setLanguage("");
  };

  const [isPending, startTransition] = useTransition();

  const setLanguageParam = (lang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("language", lang);
    startTransition(() => {
      router.push(`/popular?${params.toString()}`);
    })
    
  };

  const deleteCurrentLang = (currentLang: string) => {
    setLanguages(
      languages.filter((item) => {
        return item.id !== currentLang.toLowerCase();
      }),
    );
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
                  <button
                    onClick={() => setLanguageParam(lang.id)}
                    className="h-full px-4 text-sm transition hover:text-foreground"
                  >
                    {lang.name}
                  </button>

                  {languages.length > 6 && lang.id !== "all" && (
                    <button
                      onClick={() => deleteCurrentLang(lang.id)}
                      className="mr-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-xs text-muted transition hover:bg-danger hover:text-background"
                    >
                      X
                    </button>
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
          <input
            className="w-48 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            type="text"
            placeholder="Add language"
            onChange={(e) => setLanguage(e.target.value)}
            value={language}
          />
          <button
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-background transition hover:opacity-85 disabled:opacity-50"
            type="submit"
          >
            Add
          </button>
        </form>
      </div>
    </>
  );
};
