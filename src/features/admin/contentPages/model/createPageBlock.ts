import { createLocalizedText, type T_PageBlock, type T_PageBlockType } from "@/entities/contentPage";

const createBlockId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const createPageBlock = (type: T_PageBlockType): T_PageBlock => {
  const base = { id: createBlockId(), isVisible: true };

  if (type === "hero") {
    return { ...base, type, data: { title: createLocalizedText(), description: createLocalizedText(), imageAlt: createLocalizedText(), buttonLabel: createLocalizedText() } };
  }

  if (type === "text") {
    return { ...base, type, data: { title: createLocalizedText(), content: createLocalizedText(), alignment: "left" } };
  }

  if (type === "image") {
    return { ...base, type, data: { src: "", alt: createLocalizedText(), caption: createLocalizedText() } };
  }

  if (type === "gallery") {
    return { ...base, type, data: { title: createLocalizedText(), images: [] } };
  }

  if (type === "products") {
    return { ...base, type, data: { title: createLocalizedText(), productIds: [] } };
  }

  if (type === "categories") {
    return { ...base, type, data: { title: createLocalizedText(), categorySlugs: [] } };
  }

  if (type === "faq") {
    return { ...base, type, data: { title: createLocalizedText(), items: [] } };
  }

  if (type === "menu") {
    return { ...base, type, data: { title: createLocalizedText(), menuId: "", orientation: "vertical", variant: "default" } };
  }

  return { ...base, type, data: { title: createLocalizedText(), description: createLocalizedText(), buttonLabel: createLocalizedText() } };
};
