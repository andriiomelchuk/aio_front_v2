export type T_PageBlockBase<TType extends string, TData> = {
  id: string;
  type: TType;
  isVisible: boolean;
  data: TData;
};

export type T_HeroBlock = T_PageBlockBase<
  "hero",
  {
    title: T_LocalizedText;
    description: T_LocalizedText;
    imageUrl?: string;
    imageAlt: T_LocalizedText;
    buttonLabel: T_LocalizedText;
    buttonHref?: string;
  }
>;

export type T_TextBlock = T_PageBlockBase<
  "text",
  {
    title: T_LocalizedText;
    content: T_LocalizedText;
    alignment: "left" | "center" | "right";
  }
>;

export type T_ImageBlock = T_PageBlockBase<
  "image",
  {
    src: string;
    alt: T_LocalizedText;
    caption: T_LocalizedText;
  }
>;

export type T_GalleryBlock = T_PageBlockBase<
  "gallery",
  {
    title: T_LocalizedText;
    images: Array<{ id: string; url: string; alt: T_LocalizedText }>;
  }
>;

export type T_ProductsBlock = T_PageBlockBase<
  "products",
  { title: T_LocalizedText; productIds: string[] }
>;

export type T_CategoriesBlock = T_PageBlockBase<
  "categories",
  { title: T_LocalizedText; categorySlugs: string[] }
>;

export type T_FaqBlock = T_PageBlockBase<
  "faq",
  {
    title: T_LocalizedText;
    items: Array<{ id: string; question: T_LocalizedText; answer: T_LocalizedText }>;
  }
>;

export type T_CtaBlock = T_PageBlockBase<
  "cta",
  { title: T_LocalizedText; description: T_LocalizedText; buttonLabel: T_LocalizedText; buttonHref?: string }
>;

export type T_PageBlock =
  | T_HeroBlock
  | T_TextBlock
  | T_ImageBlock
  | T_GalleryBlock
  | T_ProductsBlock
  | T_CategoriesBlock
  | T_FaqBlock
  | T_CtaBlock;

export type T_PageBlockType = T_PageBlock["type"];
import type { T_LocalizedText } from "./types";
