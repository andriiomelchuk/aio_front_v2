import { describe, expect, it } from "vitest";
import { localizeProduct, normalizeProductTranslations } from "./localization";
import type { T_Product } from "./types";

const product = {
  id: "1", title: "Основна назва", slug: "product", sku: "SKU", description: "Основний опис",
  price: 10, currency: "UAH", stockQuantity: 1, stockStatus: "in_stock", categoryId: "test",
  status: "active", thumbnail: "", images: [], attributes: [{ name: "Колір", value: "Чорний" }],
  variants: [{ id: "black", sku: "BLACK", title: "Чорний", price: 10, stockQuantity: 1, stockStatus: "in_stock", attributes: [{ name: "Колір", value: "Чорний" }] }],
  createdAt: "2026-01-01", updatedAt: "2026-01-01", defaultLocale: "uk",
  translations: { en: { title: "English title", shortDescription: "", description: "English description", seo: { title: "", description: "", keywords: [] }, attributes: [{ name: "Color", value: "Black" }], variants: { black: { title: "Black", attributes: [{ name: "Color", value: "Black" }] } }, imageAlts: {} } },
} satisfies T_Product;

describe("product localization", () => {
  it("uses translated product, attributes and variants", () => {
    expect(localizeProduct(product, "en", "uk")).toMatchObject({
      title: "English title", description: "English description",
      attributes: [{ name: "Color", value: "Black" }],
      variants: [{ title: "Black", attributes: [{ name: "Color", value: "Black" }] }],
    });
  });

  it("falls back to the source language when translation is missing", () => {
    expect(localizeProduct(product, "de", "uk")).toMatchObject({ title: "Основна назва", description: "Основний опис" });
  });

  it("normalizes unknown translation documents without trusting extra fields", () => {
    expect(normalizeProductTranslations({ en: { title: "Title", unexpected: true }, xx: { title: "Unknown" } })).toEqual({
      en: { title: "Title", shortDescription: "", description: "", seo: { title: "", description: "", keywords: [] }, attributes: [], variants: {}, imageAlts: {} },
    });
  });

  it("keeps attribute translations attached by id and localizes image alt text", () => {
    const stableProduct: T_Product = {
      ...product,
      images: [{ id: "main-image", url: "image.jpg", alt: "Source image" }],
      attributes: [
        { id: "size", name: "Size", value: "M" },
        { id: "color", name: "Color", value: "Black" },
      ],
      translations: {
        en: {
          ...createTranslation(),
          attributes: [
            { sourceId: "color", name: "Colour", value: "Red" },
            { sourceId: "size", name: "Size", value: "L" },
          ],
          imageAlts: { "main-image": "Localized image" },
        },
      },
    };

    const localized = localizeProduct(stableProduct, "en", "uk");
    expect(localized.attributes).toMatchObject([
      { id: "size", value: "L" },
      { id: "color", value: "Red" },
    ]);
    expect(localized.images[0]?.alt).toBe("Localized image");
  });
});

const createTranslation = () => ({
  title: "English title",
  shortDescription: "",
  description: "English description",
  seo: { title: "", description: "", keywords: [] },
  attributes: [],
  variants: {},
  imageAlts: {},
});
