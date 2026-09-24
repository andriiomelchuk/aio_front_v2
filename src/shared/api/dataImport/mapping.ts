import type { T_ImportMapping, T_ImportRawRow, T_ImportTarget } from "@/entities/dataImport";
import { importFields } from "./definitions";

const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/[\s-]+/g, "_");

export const createAutomaticMapping = (headers: string[], target: T_ImportTarget): T_ImportMapping =>
  Object.fromEntries(importFields[target].map((field) => {
    const candidates = [field.key, field.label, ...field.aliases].map(normalize);
    return [field.key, headers.find((header) => candidates.includes(normalize(header))) ?? ""];
  }));

export const mapImportRow = (row: T_ImportRawRow, mapping: T_ImportMapping): T_ImportRawRow =>
  Object.fromEntries(Object.entries(mapping).map(([field, source]) => [field, source ? row[source] ?? null : null]));

export const validateMappedRow = (row: T_ImportRawRow, target: T_ImportTarget): string[] => {
  const errors = importFields[target]
    .filter((field) => field.required && (row[field.key] === null || String(row[field.key]).trim() === ""))
    .map((field) => `${field.label} is required`);
  if ((target === "products" || target === "warehouse") && row[target === "products" ? "price" : "quantity"] !== null) {
    const key = target === "products" ? "price" : "quantity";
    if (!Number.isFinite(Number(row[key])) || Number(row[key]) < 0) errors.push(`${key} must be a non-negative number`);
  }
  if (target === "products" && row.currency && !["USD", "EUR", "UAH", "GBP"].includes(String(row.currency).toUpperCase())) errors.push("currency must be USD, EUR, UAH or GBP");
  if (target === "products" && row.status && !["draft", "active", "archived"].includes(String(row.status).toLowerCase())) errors.push("product status is invalid");
  if (target === "categories" && row.status && !["active", "inactive"].includes(String(row.status).toLowerCase())) errors.push("category status is invalid");
  if (target === "warehouse" && row.condition && !["sellable", "quarantine", "damaged"].includes(String(row.condition).toLowerCase())) errors.push("warehouse condition is invalid");
  return errors;
};
