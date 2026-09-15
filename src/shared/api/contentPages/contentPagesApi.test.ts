import { afterEach, describe, expect, it, vi } from "vitest";
import { createLocalizedText } from "@/entities/contentPage";
import { createContentPage, getContentPages } from "./contentPagesApi";
import { ContentPagesApiError } from "./types";

const createStorage = (initialValue: string): Storage => {
  const values = new Map([["aio-content-pages", initialValue]]);

  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
};

afterEach(() => vi.unstubAllGlobals());

describe("content pages API migration", () => {
  it("merges legacy page translations into localized fields", async () => {
    const page = {
      id: "page-1",
      slug: "about",
      status: "published",
      defaultLocale: "en",
      title: "About us",
      blocks: [
        { id: "text-1", type: "text", isVisible: true, data: { title: "", content: "English content", alignment: "left" } },
        { id: "unknown-1", type: "unsupported", isVisible: true, data: {} },
      ],
      seo: { title: "About", description: "English SEO", noIndex: false },
      translations: {
        de: {
          title: "Über uns",
          blocks: [{ id: "text-1", type: "text", isVisible: true, data: { title: "", content: "Deutscher Inhalt", alignment: "left" } }],
          seo: { title: "Über uns", description: "Deutsche SEO", noIndex: false },
        },
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-01T00:00:00.000Z",
    };
    vi.stubGlobal("window", { localStorage: createStorage(JSON.stringify([page])) });

    const [migratedPage] = await getContentPages();

    expect(migratedPage.title.en).toBe("About us");
    expect(migratedPage.title.de).toBe("Über uns");
    expect(migratedPage.seo.description.de).toBe("Deutsche SEO");
    expect(migratedPage.blocks[0].type).toBe("text");
    if (migratedPage.blocks[0].type === "text") {
      expect(migratedPage.blocks[0].data.content.de).toBe("Deutscher Inhalt");
    }
    expect(migratedPage.blocks).toHaveLength(1);
  });
});

describe("content page root slugs", () => {
  const createPage = (slug: string) => createContentPage({
    slug,
    status: "draft",
    defaultLocale: "en",
    title: createLocalizedText("en", "Page"),
    blocks: [],
    seo: {
      title: createLocalizedText(),
      description: createLocalizedText(),
      noIndex: true,
    },
  });

  it("rejects slugs reserved by application routes", async () => {
    vi.stubGlobal("window", { localStorage: createStorage("[]") });

    await expect(createPage("products")).rejects.toMatchObject<Partial<ContentPagesApiError>>({
      code: "RESERVED_SLUG",
    });
  });

  it("rejects nested or malformed slugs", async () => {
    vi.stubGlobal("window", { localStorage: createStorage("[]") });

    await expect(createPage("about/team")).rejects.toMatchObject<Partial<ContentPagesApiError>>({
      code: "INVALID_SLUG",
    });
  });
});
