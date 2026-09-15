import type { T_PageBlock } from "./pageBlockTypes";

export type T_ContentPageStatus = "draft" | "published" | "archived";
export type T_ContentPageLocale = "uk" | "en" | "de" | "ru";
export type T_LocalizedText = Record<T_ContentPageLocale, string>;

export type T_ContentPageSeo = {
  title: T_LocalizedText;
  description: T_LocalizedText;
  imageUrl?: string;
  noIndex: boolean;
};

export type T_ContentPage = {
  id: string;
  title: T_LocalizedText;
  slug: string;
  status: T_ContentPageStatus;
  blocks: T_PageBlock[];
  seo: T_ContentPageSeo;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  defaultLocale: T_ContentPageLocale;
};

export type T_CreateContentPageDto = Omit<
  T_ContentPage,
  "id" | "createdAt" | "updatedAt" | "updatedBy"
>;

export type T_UpdateContentPageDto = Partial<
  Omit<T_ContentPage, "id" | "createdAt" | "updatedAt" | "updatedBy">
> & {
  id: string;
};
