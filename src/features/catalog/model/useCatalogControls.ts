"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  T_CatalogParams,
  T_CatalogSort,
  T_CatalogStock,
} from "./types";

const catalogSorts: T_CatalogSort[] = [
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
];
const catalogStocks: T_CatalogStock[] = [
  "all",
  "in_stock",
  "low_stock",
  "out_of_stock",
];
const catalogPageSizes = [8, 12, 24];

const getPositiveNumber = (value: string | null, fallback: number) => {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : fallback;
};

export const useCatalogControls = (fixedCategory = "") => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortParam = searchParams.get("sort") as T_CatalogSort | null;
  const stockParam = searchParams.get("stock") as T_CatalogStock | null;

  const params: T_CatalogParams = {
    search: searchParams.get("q") ?? "",
    category: fixedCategory || (searchParams.get("category") ?? ""),
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    stock:
      stockParam && catalogStocks.includes(stockParam) ? stockParam : "all",
    discountOnly: searchParams.get("discount") === "1",
    sort: sortParam && catalogSorts.includes(sortParam) ? sortParam : "name-asc",
    page: getPositiveNumber(searchParams.get("page"), 1),
    pageSize: catalogPageSizes.includes(Number(searchParams.get("size")))
      ? Number(searchParams.get("size"))
      : 12,
  };

  const updateParams = (
    changes: Partial<T_CatalogParams>,
    options: { preservePage?: boolean } = {},
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const nextValues = { ...params, ...changes };

    const setOrDelete = (key: string, value: string, defaultValue = "") => {
      if (!value || value === defaultValue) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    };

    setOrDelete("q", nextValues.search);
    if (!fixedCategory) setOrDelete("category", nextValues.category);
    setOrDelete("minPrice", nextValues.minPrice);
    setOrDelete("maxPrice", nextValues.maxPrice);
    setOrDelete("stock", nextValues.stock, "all");
    setOrDelete("discount", nextValues.discountOnly ? "1" : "");
    setOrDelete("sort", nextValues.sort, "name-asc");
    setOrDelete("size", String(nextValues.pageSize), "12");

    const nextPage = options.preservePage ? nextValues.page : 1;
    setOrDelete("page", String(nextPage), "1");

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const resetParams = () => router.replace(pathname, { scroll: false });

  return { params, updateParams, resetParams };
};
