import type { T_ComparisonState } from "./types";

export const saveComparisonToStorage = (comparison: T_ComparisonState) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("comparison", JSON.stringify(comparison));
};

export const loadComparisonFromStorage = (): T_ComparisonState | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    const rawComparison = localStorage.getItem("comparison");

    if (!rawComparison) return undefined;

    const parsedComparison: unknown = JSON.parse(rawComparison);

    if (!isComparisonState(parsedComparison)) {
      localStorage.removeItem("comparison");

      return undefined;
    }

    return parsedComparison;
  } catch {
    localStorage.removeItem("comparison");

    return undefined;
  }
};

const isComparisonState = (value: unknown): value is T_ComparisonState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "products" in value &&
    Array.isArray(value.products)
  );
}