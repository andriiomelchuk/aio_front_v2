import type { T_ContentPageLocale, T_LocalizedText } from "./types";
import type { T_PageBlock } from "./pageBlockTypes";

export const isContentPageBlockComplete = (
  block: T_PageBlock,
  locale: T_ContentPageLocale,
) => {
  if (block.type === "hero") return Boolean(block.data.title[locale].trim());
  if (block.type === "text") return Boolean(block.data.content[locale].trim());
  if (block.type === "image") return Boolean(block.data.src.trim() && block.data.alt[locale].trim());
  if (block.type === "gallery") return block.data.images.length > 0 && block.data.images.every((image) => image.url.trim() && image.alt[locale].trim());
  if (block.type === "products") return block.data.productIds.length > 0;
  if (block.type === "categories") return block.data.categorySlugs.length > 0;
  if (block.type === "faq") return block.data.items.length > 0 && block.data.items.every((item) => item.question[locale].trim() && item.answer[locale].trim());
  if (block.type === "menu") return Boolean(block.data.menuId);
  return Boolean(block.data.title[locale].trim());
};

export const isContentPageComplete = (
  title: T_LocalizedText,
  blocks: T_PageBlock[],
  locale: T_ContentPageLocale,
) => Boolean(title[locale].trim()) && blocks
  .filter((block) => block.isVisible)
  .every((block) => isContentPageBlockComplete(block, locale));
