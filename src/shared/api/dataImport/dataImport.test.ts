import { describe, expect, it } from "vitest";
import { createAutomaticMapping, mapImportRow, parseCsv, parseJson, validateMappedRow } from ".";

describe("data import parsing", () => {
  it("parses quoted CSV values and line breaks", () => {
    expect(parseCsv('sku,title,description\nA-1,"Face, cream","First line\nSecond line"')).toEqual([
      { sku: "A-1", title: "Face, cream", description: "First line\nSecond line" },
    ]);
  });

  it("accepts JSON arrays and rows envelopes", () => {
    expect(parseJson('[{"slug":"beauty"}]')).toEqual([{ slug: "beauty" }]);
    expect(parseJson('{"rows":[{"slug":"care"}]}')).toEqual([{ slug: "care" }]);
  });

  it("rejects unstructured JSON", () => {
    expect(() => parseJson('{"slug":"beauty"}')).toThrow(/array/);
  });
});

describe("data import mapping", () => {
  it("maps common aliases automatically", () => {
    const mapping = createAutomaticMapping(["article", "name", "price", "category_id", "slug"], "products");
    expect(mapping).toMatchObject({ sku: "article", title: "name", categoryId: "category_id" });
    expect(mapImportRow({ article: "A-1", name: "Cream" }, mapping)).toMatchObject({ sku: "A-1", title: "Cream" });
  });

  it("reports required and numeric row errors", () => {
    expect(validateMappedRow({ sku: "", title: "Product", slug: "product", price: -1, categoryId: "beauty" }, "products"))
      .toEqual(expect.arrayContaining(["SKU is required", "price must be a non-negative number"]));
  });
});
