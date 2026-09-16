import { afterEach, describe, expect, it, vi } from "vitest";
import type { T_CreateProductDto } from "@/entities/product/model/types";
import { createProduct, updateProduct } from "./productsApi";
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
