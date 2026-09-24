import type { T_ImportHistoryItem, T_ImportMapping, T_ImportTarget } from "@/entities/dataImport";

const HISTORY_KEY = "admin-import-history-v1";
const PRESETS_KEY = "admin-import-mapping-presets-v1";

export const readImportHistory = (): T_ImportHistoryItem[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as T_ImportHistoryItem[]; }
  catch { return []; }
};

export const saveImportHistory = (item: T_ImportHistoryItem) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...readImportHistory()].slice(0, 25)));
};

export const readMappingPreset = (target: T_ImportTarget): T_ImportMapping | null => {
  if (typeof window === "undefined") return null;
  try { return (JSON.parse(localStorage.getItem(PRESETS_KEY) ?? "{}") as Partial<Record<T_ImportTarget, T_ImportMapping>>)[target] ?? null; }
  catch { return null; }
};

export const saveMappingPreset = (target: T_ImportTarget, mapping: T_ImportMapping) => {
  if (typeof window === "undefined") return;
  let presets: Partial<Record<T_ImportTarget, T_ImportMapping>> = {};
  try { presets = JSON.parse(localStorage.getItem(PRESETS_KEY) ?? "{}"); } catch { presets = {}; }
  localStorage.setItem(PRESETS_KEY, JSON.stringify({ ...presets, [target]: mapping }));
};
