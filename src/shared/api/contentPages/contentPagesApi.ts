import type {
  T_ContentPage,
  T_CreateContentPageDto,
  T_ContentPageLocale,
  T_LocalizedText,
  T_PageBlock,
  T_UpdateContentPageDto,
} from "@/entities/contentPage";
import { contentPageLocales, createLocalizedText } from "@/entities/contentPage";
import { ContentPagesApiError } from "./types";
import { deleteManagedImage, deleteManagedImagesInValue, getManagedImageReferences } from "@/shared/lib";

const CONTENT_PAGES_STORAGE_KEY = "aio-content-pages";
const RESERVED_CONTENT_PAGE_SLUGS = new Set([
  "account",
  "admin",
  "api",
  "battle",
  "cart",
  "categories",
  "checkout",
  "comparison",
  "login",
  "movies",
  "pages",
  "popular",
  "products",
  "register",
  "todos",
  "wishlist",
]);
const CONTENT_PAGE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isLocale = (value: unknown): value is T_ContentPageLocale =>
  contentPageLocales.includes(value as T_ContentPageLocale);

const isLocalizedText = (value: unknown): value is T_LocalizedText =>
  isRecord(value) && contentPageLocales.every((locale) => typeof value[locale] === "string");

const localizedValue = (value: unknown, defaultLocale: T_ContentPageLocale) =>
  isLocalizedText(value)
    ? value
    : createLocalizedText(defaultLocale, typeof value === "string" ? value : "");

const normalizeBlock = (value: unknown, defaultLocale: T_ContentPageLocale): T_PageBlock | undefined => {
  if (!isRecord(value) || !isRecord(value.data) || typeof value.id !== "string" || typeof value.isVisible !== "boolean") return undefined;
  const data = value.data;
  const base = { id: value.id, isVisible: value.isVisible };

  if (value.type === "hero") return { ...base, type: "hero", data: { title: localizedValue(data.title, defaultLocale), description: localizedValue(data.description, defaultLocale), imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : undefined, imageAlt: localizedValue(data.imageAlt, defaultLocale), buttonLabel: localizedValue(data.buttonLabel, defaultLocale), buttonHref: typeof data.buttonHref === "string" ? data.buttonHref : undefined } };
  if (value.type === "text") return { ...base, type: "text", data: { title: localizedValue(data.title, defaultLocale), content: localizedValue(data.content, defaultLocale), alignment: data.alignment === "center" || data.alignment === "right" ? data.alignment : "left" } };
  if (value.type === "image") return { ...base, type: "image", data: { src: typeof data.src === "string" ? data.src : "", alt: localizedValue(data.alt, defaultLocale), caption: localizedValue(data.caption, defaultLocale) } };
  if (value.type === "gallery") return { ...base, type: "gallery", data: { title: localizedValue(data.title, defaultLocale), images: Array.isArray(data.images) ? data.images.filter(isRecord).map((image, index) => ({ id: typeof image.id === "string" ? image.id : `${value.id}-${index}`, url: typeof image.url === "string" ? image.url : "", alt: localizedValue(image.alt, defaultLocale) })) : [] } };
  if (value.type === "products") return { ...base, type: "products", data: { title: localizedValue(data.title, defaultLocale), productIds: Array.isArray(data.productIds) ? data.productIds.filter((id): id is string => typeof id === "string") : [] } };
  if (value.type === "categories") return { ...base, type: "categories", data: { title: localizedValue(data.title, defaultLocale), categorySlugs: Array.isArray(data.categorySlugs) ? data.categorySlugs.filter((slug): slug is string => typeof slug === "string") : [] } };
  if (value.type === "faq") return { ...base, type: "faq", data: { title: localizedValue(data.title, defaultLocale), items: Array.isArray(data.items) ? data.items.filter(isRecord).map((item, index) => ({ id: typeof item.id === "string" ? item.id : `${value.id}-${index}`, question: localizedValue(item.question, defaultLocale), answer: localizedValue(item.answer, defaultLocale) })) : [] } };
  if (value.type === "cta") return { ...base, type: "cta", data: { title: localizedValue(data.title, defaultLocale), description: localizedValue(data.description, defaultLocale), buttonLabel: localizedValue(data.buttonLabel, defaultLocale), buttonHref: typeof data.buttonHref === "string" ? data.buttonHref : undefined } };
  return undefined;
};

const normalizeContentPage = (value: unknown): T_ContentPage | undefined => {
  if (!isRecord(value) || !isRecord(value.seo) || typeof value.id !== "string" || typeof value.slug !== "string" || !Array.isArray(value.blocks) || typeof value.createdAt !== "string" || typeof value.updatedAt !== "string") return undefined;
  if (value.status !== "draft" && value.status !== "published" && value.status !== "archived") return undefined;
  const defaultLocale = isLocale(value.defaultLocale) ? value.defaultLocale : "en";
  const blocks = value.blocks
    .map((block) => normalizeBlock(block, defaultLocale))
    .filter((block): block is T_PageBlock => Boolean(block));

  const page: T_ContentPage = {
    id: value.id,
    slug: value.slug,
    status: value.status,
    title: localizedValue(value.title, defaultLocale),
    blocks,
    seo: {
      title: localizedValue(value.seo.title, defaultLocale),
      description: localizedValue(value.seo.description, defaultLocale),
      imageUrl: typeof value.seo.imageUrl === "string" ? value.seo.imageUrl : undefined,
      noIndex: typeof value.seo.noIndex === "boolean" ? value.seo.noIndex : true,
    },
    defaultLocale,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    updatedBy: typeof value.updatedBy === "string" ? value.updatedBy : undefined,
  };

  if (isRecord(value.translations)) {
    const translations = value.translations;
    contentPageLocales.forEach((locale) => {
      const translation = translations[locale];
      if (!isRecord(translation)) return;
      if (typeof translation.title === "string") page.title[locale] = translation.title;
      if (isRecord(translation.seo)) {
        if (typeof translation.seo.title === "string") page.seo.title[locale] = translation.seo.title;
        if (typeof translation.seo.description === "string") page.seo.description[locale] = translation.seo.description;
      }
      if (!Array.isArray(translation.blocks)) return;
      const translatedBlocks = translation.blocks;

      page.blocks.forEach((block, index) => {
        const translatedBlock = translatedBlocks.find((item) => isRecord(item) && item.id === block.id) ?? translatedBlocks[index];
        if (!isRecord(translatedBlock) || !isRecord(translatedBlock.data)) return;
        const translatedData = translatedBlock.data;
        const assign = (target: T_LocalizedText, source: unknown) => {
          if (typeof source === "string") target[locale] = source;
        };

        if (block.type === "hero") {
          assign(block.data.title, translatedData.title);
          assign(block.data.description, translatedData.description);
          assign(block.data.imageAlt, translatedData.imageAlt);
          assign(block.data.buttonLabel, translatedData.buttonLabel);
        } else if (block.type === "text") {
          assign(block.data.title, translatedData.title);
          assign(block.data.content, translatedData.content);
        } else if (block.type === "image") {
          assign(block.data.alt, translatedData.alt);
          assign(block.data.caption, translatedData.caption);
        } else if (block.type === "gallery") {
          assign(block.data.title, translatedData.title);
          if (Array.isArray(translatedData.images)) {
            const translatedImages = translatedData.images;
            block.data.images.forEach((image, imageIndex) => {
            const translatedImage = translatedImages.find((item) => isRecord(item) && item.id === image.id) ?? translatedImages[imageIndex];
            if (isRecord(translatedImage)) assign(image.alt, translatedImage.alt);
          });
          }
        } else if (block.type === "products" || block.type === "categories") {
          assign(block.data.title, translatedData.title);
        } else if (block.type === "faq") {
          assign(block.data.title, translatedData.title);
          if (Array.isArray(translatedData.items)) {
            const translatedItems = translatedData.items;
            block.data.items.forEach((item, itemIndex) => {
            const translatedItem = translatedItems.find((entry) => isRecord(entry) && entry.id === item.id) ?? translatedItems[itemIndex];
            if (isRecord(translatedItem)) {
              assign(item.question, translatedItem.question);
              assign(item.answer, translatedItem.answer);
            }
          });
          }
        } else {
          assign(block.data.title, translatedData.title);
          assign(block.data.description, translatedData.description);
          assign(block.data.buttonLabel, translatedData.buttonLabel);
        }
      });
    });
  }

  return page;
};

const getStorage = (): Storage | undefined => {
  if (typeof window === "undefined") return undefined;

  return window.localStorage;
};

const loadContentPages = (): T_ContentPage[] => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const value: unknown = JSON.parse(
      storage.getItem(CONTENT_PAGES_STORAGE_KEY) ?? "[]",
    );

    if (!Array.isArray(value)) {
      storage.removeItem(CONTENT_PAGES_STORAGE_KEY);
      return [];
    }
    const pages = value.map(normalizeContentPage).filter((page): page is T_ContentPage => Boolean(page));
    if (pages.length !== value.length) storage.setItem(CONTENT_PAGES_STORAGE_KEY, JSON.stringify(pages));
    return pages;
  } catch {
    storage.removeItem(CONTENT_PAGES_STORAGE_KEY);
    return [];
  }
};

const saveContentPages = (pages: T_ContentPage[]) => {
  const storage = getStorage();

  if (!storage) {
    throw new ContentPagesApiError(
      "STORAGE_UNAVAILABLE",
      "Content page storage is unavailable",
    );
  }

  try {
    storage.setItem(CONTENT_PAGES_STORAGE_KEY, JSON.stringify(pages));
  } catch {
    throw new ContentPagesApiError(
      "STORAGE_WRITE_FAILED",
      "Could not save content pages",
    );
  }
};

const createContentPageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

const ensureUniqueSlug = (
  pages: T_ContentPage[],
  slug: string,
  ignoredPageId?: string,
) => {
  const normalizedSlug = normalizeSlug(slug);

  if (!CONTENT_PAGE_SLUG_PATTERN.test(normalizedSlug)) {
    throw new ContentPagesApiError(
      "INVALID_SLUG",
      `Content page slug "${normalizedSlug}" is invalid`,
    );
  }

  if (RESERVED_CONTENT_PAGE_SLUGS.has(normalizedSlug)) {
    throw new ContentPagesApiError(
      "RESERVED_SLUG",
      `Content page slug "${normalizedSlug}" is reserved`,
    );
  }
  const duplicatePage = pages.some(
    (page) =>
      page.id !== ignoredPageId && normalizeSlug(page.slug) === normalizedSlug,
  );

  if (duplicatePage) {
    throw new ContentPagesApiError(
      "DUPLICATE_SLUG",
      `Content page with slug "${normalizedSlug}" already exists`,
    );
  }

  return normalizedSlug;
};

export const getContentPages = async (): Promise<T_ContentPage[]> =>
  loadContentPages();

export const getContentPageById = async (
  id: string,
): Promise<T_ContentPage> => {
  const page = loadContentPages().find((item) => item.id === id);

  if (!page) {
    throw new ContentPagesApiError("NOT_FOUND", "Content page not found");
  }

  return page;
};

export const getContentPageBySlug = async (
  slug: string,
): Promise<T_ContentPage> => {
  const normalizedSlug = normalizeSlug(slug);
  const page = loadContentPages().find(
    (item) => normalizeSlug(item.slug) === normalizedSlug,
  );

  if (!page) {
    throw new ContentPagesApiError("NOT_FOUND", "Content page not found");
  }

  return page;
};

export const createContentPage = async (
  input: T_CreateContentPageDto,
): Promise<T_ContentPage> => {
  const pages = loadContentPages();
  const timestamp = new Date().toISOString();
  const slug = ensureUniqueSlug(pages, input.slug);
  const page: T_ContentPage = {
    ...input,
    id: createContentPageId(),
    slug,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  saveContentPages([page, ...pages]);

  return page;
};

export const updateContentPage = async (
  input: T_UpdateContentPageDto,
): Promise<T_ContentPage> => {
  const pages = loadContentPages();
  const pageIndex = pages.findIndex((page) => page.id === input.id);

  if (pageIndex === -1) {
    throw new ContentPagesApiError("NOT_FOUND", "Content page not found");
  }

  const currentPage = pages[pageIndex];
  const updatedPage: T_ContentPage = {
    ...currentPage,
    ...input,
    id: currentPage.id,
    slug:
      input.slug === undefined
        ? currentPage.slug
        : ensureUniqueSlug(pages, input.slug, currentPage.id),
    createdAt: currentPage.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const updatedPages = [...pages];

  updatedPages[pageIndex] = updatedPage;
  saveContentPages(updatedPages);

  const retainedReferences = new Set(getManagedImageReferences(updatedPage));
  const removedReferences = getManagedImageReferences(currentPage).filter(
    (reference) => !retainedReferences.has(reference),
  );
  await Promise.all(removedReferences.map(deleteManagedImage));

  return updatedPage;
};

export const deleteContentPage = async (id: string): Promise<string> => {
  const pages = loadContentPages();

  if (!pages.some((page) => page.id === id)) {
    throw new ContentPagesApiError("NOT_FOUND", "Content page not found");
  }

  const deletedPage = pages.find((page) => page.id === id);
  saveContentPages(pages.filter((page) => page.id !== id));
  await deleteManagedImagesInValue(deletedPage);

  return id;
};
