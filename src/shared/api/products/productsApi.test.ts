import { afterEach, describe, expect, it, vi } from "vitest";
import type { T_CreateProductDto } from "@/entities/product/model/types";
import {
  createProduct,
  exportProducts,
  getProducts,
  importProducts,
  updateProduct,
} from "./productsApi";
import type { ProductsApiError } from "./types";

const createStorage = (initial: Record<string, string> = {}): Storage => {
  const values = new Map(Object.entries(initial));
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
};

const stubBrowser = (storage: Storage) => {
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
};

afterEach(() => vi.unstubAllGlobals());

describe("product slug uniqueness", () => {
  it("rejects a duplicate slug regardless of casing", async () => {
    const existingProduct = { id: "product-1", slug: "red-lipstick" };
    const storage = createStorage({
      "admin-products-overrides": JSON.stringify({ "product-1": existingProduct }),
    });
    stubBrowser(storage);

    await expect(
      createProduct({ slug: "  Red-Lipstick  " } as T_CreateProductDto),
    ).rejects.toMatchObject<Partial<ProductsApiError>>({ code: "DUPLICATE_SLUG" });
  });

  it("allows a product to retain its own slug while editing", async () => {
    const existingProduct = { id: "product-1", slug: "red-lipstick" };
    const storage = createStorage({
      "admin-products-overrides": JSON.stringify({ "product-1": existingProduct }),
    });
    stubBrowser(storage);

    await expect(
      updateProduct({ id: "product-1", slug: "RED-LIPSTICK" }),
    ).resolves.toMatchObject({ id: "product-1", slug: "red-lipstick" });
  });
});

describe("product translations storage migration", () => {
  it("preserves legacy products and creates a backup before migration", async () => {
    const legacyProduct = {
      id: "legacy-1",
      title: "Legacy product",
      slug: "legacy-product",
      sku: "LEGACY-1",
      description: "Original description",
      price: 10,
      currency: "USD",
      stockQuantity: 2,
      stockStatus: "in_stock",
      categoryId: "test",
      status: "active",
      thumbnail: "",
      images: [],
      attributes: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const raw = JSON.stringify({ "legacy-1": legacyProduct });
    const storage = createStorage({ "admin-products-overrides": raw });
    stubBrowser(storage);

    const products = await getProducts();

    expect(products).toContainEqual(
      expect.objectContaining({
        ...legacyProduct,
        stockStatus: "low_stock",
        defaultLocale: "uk",
        translations: {},
      }),
    );
    expect(
      JSON.parse(storage.getItem("admin-products-overrides") ?? "{}"),
    ).toMatchObject({
      "legacy-1": {
        ...legacyProduct,
        defaultLocale: "uk",
        translations: {},
      },
    });
    expect(storage.getItem("admin-products-migration-backup-v0")).toBe(raw);
    expect(storage.getItem("admin-products-version")).toBe("3");
  });
});

describe("product translations transfer contract", () => {
  it("preserves translations through import and export", async () => {
    const storage = createStorage();
    stubBrowser(storage);
    const product = {
      id: "translated-1",
      title: "Назва",
      slug: "translated-product",
      sku: "TR-1",
      description: "Опис",
      price: 10,
      currency: "USD" as const,
      stockQuantity: 10,
      stockStatus: "in_stock" as const,
      categoryId: "test",
      status: "active" as const,
      thumbnail: "",
      images: [],
      attributes: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      defaultLocale: "uk" as const,
      translations: {
        en: {
          title: "Title",
          shortDescription: "",
          description: "Description",
          seo: { title: "", description: "", keywords: [] },
          attributes: [],
          variants: {},
          imageAlts: {},
        },
      },
    };

    await importProducts({
      schemaVersion: 2,
      exportedAt: "2026-01-01T00:00:00.000Z",
      products: [product],
    });
    const exported = await exportProducts();

    expect(exported.schemaVersion).toBe(2);
    expect(exported.products[0]?.translations?.en?.title).toBe("Title");
  });
});
