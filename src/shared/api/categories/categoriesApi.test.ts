import { afterEach, describe, expect, it, vi } from "vitest";
import { createCategory, getCategories, updateCategory } from "./categoriesApi";
import type { CategoriesApiError } from "./types";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
};

const remoteCategories = [
  { slug: "beauty", name: "Beauty", url: "/products/category/beauty" },
];

const stubBrowser = () => {
  const storage = createStorage();
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => remoteCategories,
  }));
};

afterEach(() => vi.unstubAllGlobals());

describe("category slug uniqueness", () => {
  it("rejects a duplicate slug regardless of casing", async () => {
    stubBrowser();

    await expect(
      createCategory({ name: "Duplicate", slug: " BEAUTY ", status: "active" }),
    ).rejects.toMatchObject<Partial<CategoriesApiError>>({ code: "DUPLICATE_SLUG" });
  });

  it("persists a created category and prevents creating it twice", async () => {
    stubBrowser();

    await createCategory({ name: "Offers", slug: "Offers", status: "active" });
    await expect(
      createCategory({ name: "Offers 2", slug: "offers", status: "active" }),
    ).rejects.toMatchObject<Partial<CategoriesApiError>>({ code: "DUPLICATE_SLUG" });
    await expect(getCategories()).resolves.toContainEqual({
      id: "offers",
      name: "Offers",
      slug: "offers",
      status: "active",
    });
  });

  it("allows the current category to retain its slug", async () => {
    stubBrowser();

    await expect(
      updateCategory({ id: "beauty", name: "Beauty products", slug: "BEAUTY", status: "active" }),
    ).resolves.toMatchObject({ id: "beauty", slug: "beauty" });
  });
});
