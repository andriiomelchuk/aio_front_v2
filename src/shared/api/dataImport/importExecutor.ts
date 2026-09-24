import type { T_CreateCategoryDto } from "@/entities/categories";
import type { T_ImportPreviewRow, T_ImportRawRow, T_ImportResult, T_ImportStrategy, T_ImportTarget } from "@/entities/dataImport";
import type { T_CreateProductDto, T_ProductCurrency, T_ProductStatus } from "@/entities/product";
import type { T_InventoryCondition } from "@/entities/warehouse";
import { createCategory, getCategories, updateCategory } from "@/shared/api/categories";
import { createProduct, getProducts, updateProduct } from "@/shared/api/products";
import { getWarehouseState, recordInventoryMovement } from "@/shared/api/warehouse";
import { validateMappedRow } from "./mapping";

const text = (row: T_ImportRawRow, key: string) => String(row[key] ?? "").trim();
const number = (row: T_ImportRawRow, key: string) => Number(row[key] ?? 0);

const getProductInput = (row: T_ImportRawRow): T_CreateProductDto => {
  const stockQuantity = number(row, "stockQuantity");
  const currency = text(row, "currency").toUpperCase();
  const status = text(row, "status").toLowerCase();
  return {
    sku: text(row, "sku"), title: text(row, "title"), slug: text(row, "slug").toLowerCase(),
    shortDescription: "", description: text(row, "description"), price: number(row, "price"),
    currency: (["USD", "EUR", "UAH", "GBP"].includes(currency) ? currency : "USD") as T_ProductCurrency,
    stockQuantity, stockStatus: stockQuantity <= 0 ? "out_of_stock" : "in_stock",
    categoryId: text(row, "categoryId"),
    status: (["draft", "active", "archived"].includes(status) ? status : "active") as T_ProductStatus,
    thumbnail: text(row, "thumbnail"), images: [], attributes: [],
  };
};

const getCategoryInput = (row: T_ImportRawRow): T_CreateCategoryDto => ({
  slug: text(row, "slug").toLowerCase(), name: text(row, "name"),
  description: text(row, "description"), status: text(row, "status") === "inactive" ? "inactive" : "active",
});

export const createImportPreview = async (
  rows: T_ImportRawRow[], target: T_ImportTarget, strategy: T_ImportStrategy,
): Promise<T_ImportPreviewRow[]> => {
  const products = target === "products" || target === "warehouse" ? await getProducts() : [];
  const categories = target === "categories" ? await getCategories() : [];
  const warehouseState = target === "warehouse" ? await getWarehouseState() : null;
  const productKeys = new Set(products.flatMap((product) => [product.sku.toLowerCase(), product.slug.toLowerCase()]));
  const categoryKeys = new Set(categories.map((category) => category.slug.toLowerCase()));
  const seenKeys = new Set<string>();
  return rows.map((values, index) => {
    const errors = validateMappedRow(values, target);
    const rowKey = text(values, target === "categories" ? "slug" : "sku").toLowerCase();
    if (rowKey && seenKeys.has(rowKey)) errors.push("Duplicate identifier in the imported file");
    seenKeys.add(rowKey);
    if (target === "warehouse" && warehouseState) {
      const warehouse = warehouseState.warehouses.find((item) => item.code.toLowerCase() === text(values, "warehouseCode").toLowerCase());
      if (!products.some((product) => product.sku.toLowerCase() === rowKey)) errors.push("Product SKU was not found");
      if (!warehouse) errors.push("Warehouse code was not found");
      else if (!warehouse.locations.some((location) => location.code.toLowerCase() === text(values, "locationCode").toLowerCase())) errors.push("Location code was not found");
    }
    const exists = target === "categories"
      ? categoryKeys.has(text(values, "slug").toLowerCase())
      : productKeys.has(text(values, target === "warehouse" ? "sku" : "sku").toLowerCase()) || (target === "products" && productKeys.has(text(values, "slug").toLowerCase()));
    let action: T_ImportPreviewRow["action"] = exists ? "update" : "create";
    if (target === "warehouse") action = exists ? "update" : "skip";
    else if ((exists && strategy === "create") || (!exists && strategy === "update")) action = "skip";
    if (errors.length) action = "skip";
    return { rowNumber: index + 2, values, action, errors };
  });
};

export const executeImport = async (
  preview: T_ImportPreviewRow[], target: T_ImportTarget, createdBy: string,
): Promise<T_ImportResult> => {
  const result: T_ImportResult = { total: preview.length, created: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  for (const row of preview) {
    if (row.action === "skip") { result.skipped += 1; continue; }
    try {
      if (target === "products") {
        const products = await getProducts();
        const input = getProductInput(row.values);
        const current = products.find((product) => product.sku.toLowerCase() === input.sku.toLowerCase() || product.slug.toLowerCase() === input.slug);
        if (current) await updateProduct({ id: current.id, ...input, updatedBy: createdBy });
        else await createProduct({ ...input, updatedBy: createdBy });
      } else if (target === "categories") {
        const categories = await getCategories();
        const input = getCategoryInput(row.values);
        const current = categories.find((category) => category.slug.toLowerCase() === input.slug);
        if (current) await updateCategory({ ...current, ...input, id: current.id });
        else await createCategory(input);
      } else {
        const [products, warehouseState] = await Promise.all([getProducts(), getWarehouseState()]);
        const product = products.find((item) => item.sku.toLowerCase() === text(row.values, "sku").toLowerCase());
        const warehouse = warehouseState.warehouses.find((item) => item.code.toLowerCase() === text(row.values, "warehouseCode").toLowerCase());
        const location = warehouse?.locations.find((item) => item.code.toLowerCase() === text(row.values, "locationCode").toLowerCase());
        if (!product || !warehouse || !location) throw new Error("Product SKU, warehouse code or location code was not found.");
        const requestedCondition = text(row.values, "condition").toLowerCase();
        const condition = (["sellable", "quarantine", "damaged"].includes(requestedCondition) ? requestedCondition : "sellable") as T_InventoryCondition;
        const current = warehouseState.balances.find((balance) => balance.productId === product.id && balance.warehouseId === warehouse.id && balance.locationId === location.id && balance.condition === condition)?.physical ?? 0;
        const delta = number(row.values, "quantity") - current;
        if (delta) await recordInventoryMovement({
          type: "adjustment", productId: product.id, quantity: Math.abs(delta), condition,
          adjustmentDirection: delta > 0 ? "increase" : "decrease",
          ...(delta > 0 ? { toWarehouseId: warehouse.id, toLocationId: location.id } : { fromWarehouseId: warehouse.id, fromLocationId: location.id }),
          reason: "File import balance adjustment", reference: "AIO-029", createdBy,
        });
      }
      result[row.action === "create" ? "created" : "updated"] += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push({ rowNumber: row.rowNumber, message: error instanceof Error ? error.message : "Unknown import error" });
    }
  }
  return result;
};

export const downloadImportErrors = (result: T_ImportResult) => {
  const content = ["row,message", ...result.errors.map(({ rowNumber, message }) => `${rowNumber},"${message.replaceAll('"', '""')}"`)].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "import-errors.csv"; anchor.click(); URL.revokeObjectURL(url);
};
