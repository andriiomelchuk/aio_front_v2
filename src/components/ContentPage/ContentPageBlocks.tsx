import type { T_ContentPageLocale, T_PageBlock } from "@/entities/contentPage";
import {
  HeroContentBlock,
  ImageContentBlock,
  TextContentBlock,
  CategoriesContentBlock,
  CtaContentBlock,
  FaqContentBlock,
  GalleryContentBlock,
  ProductsContentBlock,
} from "./blocks";

export const ContentPageBlocks = ({
  blocks,
  preview = false,
  locale,
  defaultLocale,
}: {
  blocks: T_PageBlock[];
  preview?: boolean;
  locale: T_ContentPageLocale;
  defaultLocale: T_ContentPageLocale;
}) =>
  blocks.map((block) => {
    if (block.type === "hero") {
      return <HeroContentBlock key={block.id} block={block} preview={preview} locale={locale} defaultLocale={defaultLocale} />;
    }

    if (block.type === "text") {
      return <TextContentBlock key={block.id} block={block} preview={preview} locale={locale} defaultLocale={defaultLocale} />;
    }

    if (block.type === "image") return <ImageContentBlock key={block.id} block={block} preview={preview} locale={locale} defaultLocale={defaultLocale} />;
    if (block.type === "gallery") return <GalleryContentBlock key={block.id} block={block} preview={preview} locale={locale} defaultLocale={defaultLocale} />;
    if (block.type === "products") return <ProductsContentBlock key={block.id} block={block} preview={preview} locale={locale} defaultLocale={defaultLocale} />;
    if (block.type === "categories") return <CategoriesContentBlock key={block.id} block={block} preview={preview} locale={locale} defaultLocale={defaultLocale} />;
    if (block.type === "faq") return <FaqContentBlock key={block.id} block={block} preview={preview} locale={locale} defaultLocale={defaultLocale} />;

    return <CtaContentBlock key={block.id} block={block} preview={preview} locale={locale} defaultLocale={defaultLocale} />;
  });
