"use client";
import { useEffect, useState } from "react";
import { Languages } from "./types";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { checkLanguageExists } from "@/lib/api";

const STORAGE_KEY = "popularLanguages";

const defaultLanguages: Languages[] = [
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
    return JSON.parse(savedLanguages) as Languages[];
  } catch {
    return defaultLanguages;
  }
};

export const PopularLanguages = () => {
  const [languages, setLanguages] = useState<Languages[]>(getInitialLanguages);

  const [language, setLanguage] = useState<string>("");

  const searchParams = useSearchParams();
  const router = useRouter();

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

  const setLanguageParam = (lang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("language", lang);
    router.push(`/popular?${params.toString()}`);
  };

  const deleteCurrentLang = (currentLang: string) => {
    setLanguages(
      languages.filter((item) => {
        return item.id !== currentLang.toLowerCase();
      }),
    );
  };

  return (
    <div className="flex flex-col gap-4 justify-left items-center">
      <ul className="flex gap-4">
        {languages.map((lang) => (
          <li key={lang.id} className="relative">
            <button
              onClick={() => setLanguageParam(lang.id)}
              className="rounded-md  py-2 pl-4 pr-10 text-sm"
            >
              {lang.name}
            </button>
            <div className="w-6">
              {languages.length > 6 && lang.id !== "all" && (
                <button
                  onClick={() => deleteCurrentLang(lang.id)}
                  className="absolute right-2 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-xs text-gray-400 transition hover:bg-red-500 hover:text-white"
                >
                  X
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          addLanguage(language);
        }}
      >
        <input
          className="border border-white-300 placeholder:text-gray-400 placeholder:text-sm rounded-md px-3 py-2"
          type="text"
          placeholder="Add your language"
          onChange={(e) => setLanguage(e.target.value)}
          value={language}
        />
        <button
          className="border border-white-300 px-4 py-1 text-sm"
          type="submit"
        >
          ADD
        </button>
      </form>
    </div>
  );
};
