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
      <div className="flex flex-col gap-4 justify-left items-center">
        <ul className="flex gap-4">
          {languages.map((lang) => {
            const isActive = currentLanguage === lang.id;
            return (
              <li key={lang.id} className="relative">
                <div
                  className={`flex h-9 items-center rounded-full border transition ${
                    isActive
                      ? "border-green-500 bg-green-500/15 text-white"
                      : "border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-green-500"
                  }`}
                >
                  <button
                    onClick={() => setLanguageParam(lang.id)}
                    className="h-full px-4 text-sm text-zinc-200 transition hover:text-white"
                  >
                    {lang.name}
                  </button>

                  {languages.length > 6 && lang.id !== "all" && (
                    <button
                      onClick={() => deleteCurrentLang(lang.id)}
                      className="mr-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-zinc-500 transition hover:bg-red-500 hover:text-white cursor-pointer"
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
          className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 transition focus-within:border-green-500"
          onSubmit={(e) => {
            e.preventDefault();
            addLanguage(language);
          }}
        >
          <input
            className="w-48 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            type="text"
            placeholder="Add language"
            onChange={(e) => setLanguage(e.target.value)}
            value={language}
          />
          <button
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
            type="submit"
          >
            Add
          </button>
        </form>
      </div>
    </>
  );
};
