import { getLocalizedText, type T_ContentPage, type T_ContentPageLocale, type T_ContentPageStatus } from "@/entities/contentPage";
import type { T_ContentPagesSort } from "./types";

export const filterContentPages = (
  pages: T_ContentPage[],
  params: { search: string; status: T_ContentPageStatus | "all" },
) => {
  const search = params.search.trim().toLowerCase();

  return pages.filter((page) => {
    const matchesStatus = params.status === "all" || page.status === params.status;
    const matchesSearch =
      search === "" ||
      Object.values(page.title).some((title) => title.toLowerCase().includes(search)) ||
      page.slug.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });
};

export const sortContentPages = (
  pages: T_ContentPage[],
  sort: T_ContentPagesSort,
  locale: T_ContentPageLocale,
) =>
  [...pages].sort((firstPage, secondPage) => {
    if (sort === "title-asc") {
      return getLocalizedText(firstPage.title, locale, firstPage.defaultLocale).localeCompare(getLocalizedText(secondPage.title, locale, secondPage.defaultLocale));
    }

    if (sort === "title-desc") {
      return getLocalizedText(secondPage.title, locale, secondPage.defaultLocale).localeCompare(getLocalizedText(firstPage.title, locale, firstPage.defaultLocale));
    }

    return Date.parse(secondPage.updatedAt) - Date.parse(firstPage.updatedAt);
  });
