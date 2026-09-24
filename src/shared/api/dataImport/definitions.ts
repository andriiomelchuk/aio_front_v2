import type { T_ImportField, T_ImportTarget } from "@/entities/dataImport";

export const importFields: Record<T_ImportTarget, T_ImportField[]> = {
  products: [
    { key: "sku", label: "SKU", required: true, aliases: ["article", "артикул"] },
    { key: "title", label: "Title", required: true, aliases: ["name", "назва", "название"] },
    { key: "slug", label: "Slug", required: true, aliases: ["url", "key"] },
    { key: "description", label: "Description", required: false, aliases: ["опис", "описание"] },
    { key: "price", label: "Price", required: true, aliases: ["ціна", "цена"] },
    { key: "currency", label: "Currency", required: false, aliases: ["валюта"] },
    { key: "categoryId", label: "Category ID", required: true, aliases: ["category", "category_id"] },
    { key: "stockQuantity", label: "Stock quantity", required: false, aliases: ["stock", "quantity"] },
    { key: "status", label: "Status", required: false, aliases: [] },
    { key: "thumbnail", label: "Thumbnail URL", required: false, aliases: ["image", "image_url"] },
  ],
  categories: [
    { key: "slug", label: "Slug", required: true, aliases: ["url", "key"] },
    { key: "name", label: "Name", required: true, aliases: ["title", "назва", "название"] },
    { key: "description", label: "Description", required: false, aliases: ["опис", "описание"] },
    { key: "status", label: "Status", required: false, aliases: [] },
  ],
  warehouse: [
    { key: "sku", label: "Product SKU", required: true, aliases: ["product_sku", "артикул"] },
    { key: "warehouseCode", label: "Warehouse code", required: true, aliases: ["warehouse", "warehouse_code"] },
    { key: "locationCode", label: "Location code", required: true, aliases: ["location", "location_code"] },
    { key: "quantity", label: "Target quantity", required: true, aliases: ["stock", "balance"] },
    { key: "condition", label: "Condition", required: false, aliases: ["state"] },
  ],
};

export const importTemplates: Record<T_ImportTarget, string> = {
  products: "sku,title,slug,description,price,currency,categoryId,stockQuantity,status,thumbnail\nSKU-001,Example product,example-product,Description,19.99,USD,beauty,10,active,",
  categories: "slug,name,description,status\nbeauty,Beauty,Beauty products,active",
  warehouse: "sku,warehouseCode,locationCode,quantity,condition\nSKU-001,CENTRAL,MAIN,10,sellable",
};
