import type { T_ImportFormat, T_ImportRawRow } from "@/entities/dataImport";

const rowsToObjects = (rows: T_ImportCell[][]): T_ImportRawRow[] => {
  const [header = [], ...body] = rows;
  const keys = header.map((cell) => String(cell ?? "").trim());
  if (!keys.length || keys.some((key) => !key)) throw new Error("The header row contains an empty column name.");
  return body.filter((row) => row.some((cell) => cell !== null && cell !== "")).map((row) =>
    Object.fromEntries(keys.map((key, index) => [key, row[index] ?? null])),
  );
};

type T_ImportCell = string | number | boolean | null;

export const parseCsv = (text: string): T_ImportRawRow[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { row.push(value.trim()); value = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value.trim()); rows.push(row); row = []; value = "";
    } else value += character;
  }
  if (value || row.length) { row.push(value.trim()); rows.push(row); }
  return rowsToObjects(rows);
};

export const parseJson = (text: string): T_ImportRawRow[] => {
  const parsed: unknown = JSON.parse(text);
  const rows = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && "rows" in parsed ? (parsed as { rows: unknown }).rows : null;
  if (!Array.isArray(rows) || rows.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error('JSON must be an array of objects or an object with a "rows" array.');
  }
  return rows as T_ImportRawRow[];
};

export const getImportFormat = (fileName: string): T_ImportFormat => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "csv" || extension === "json" || extension === "xlsx") return extension;
  throw new Error("Only CSV, XLSX and JSON files are supported.");
};

export const parseImportFile = async (file: File): Promise<T_ImportRawRow[]> => {
  const format = getImportFormat(file.name);
  if (format === "csv") return parseCsv(await file.text());
  if (format === "json") return parseJson(await file.text());
  const { readSheet } = await import("read-excel-file/browser");
  return rowsToObjects((await readSheet(file)) as T_ImportCell[][]);
};
