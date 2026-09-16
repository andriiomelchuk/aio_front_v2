import type {
  T_Categories,
  T_CreateCategoryDto,
  T_UpdateCategoryDto,
} from "@/entities/categories/model/types";
import {
  CategoriesApiError,
  type T_JsonPlaceholderCategory,
} from "./types";

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();
const CATEGORIES_STORAGE_KEY = "admin-categories-overrides";

type T_CategoryOverrides = Record<string, T_Categories>;

const getStoredCategoryOverrides = (): T_CategoryOverrides => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      localStorage.getItem(CATEGORIES_STORAGE_KEY) ?? "{}",
    ) as T_CategoryOverrides;
  } catch {
    return {};
  }
};

const saveStoredCategoryOverrides = (categories: T_CategoryOverrides) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
};

const assertUniqueSlug = (
  categories: T_Categories[],
  slug: string,
  ignoredCategoryId?: string,
) => {
  const normalizedSlug = normalizeSlug(slug);
  const duplicate = categories.some(
    (category) =>
      category.id !== ignoredCategoryId &&
      normalizeSlug(category.slug) === normalizedSlug,
  );

  if (duplicate) {
    throw new CategoriesApiError(
      "DUPLICATE_SLUG",
      `Category with slug "${normalizedSlug}" already exists`,
    );
  }

  return normalizedSlug;
};

export const createCategory = async (category: T_CreateCategoryDto) => {
  console.log("Create category request:", category);

  const categories = await getCategories();
  const slug = assertUniqueSlug(categories, category.slug);
  const createdCategory = {
    id: slug,
    ...category,
    slug,
  };
  const overrides = getStoredCategoryOverrides();

  saveStoredCategoryOverrides({
    ...overrides,
    [createdCategory.id]: createdCategory,
  });

  return createdCategory;
};

export const updateCategory = async (category: T_UpdateCategoryDto) => {
  console.log("Update category request:", category);

  const categories = await getCategories();
  const currentCategory = categories.find((item) => item.id === category.id);

  if (!currentCategory) {
    throw new CategoriesApiError("NOT_FOUND", "Category not found");
  }

  const slug = assertUniqueSlug(categories, category.slug, category.id);
  const updatedCategory = { ...category, id: currentCategory.id, slug };
  const overrides = getStoredCategoryOverrides();

  saveStoredCategoryOverrides({
    ...overrides,
    [updatedCategory.id]: updatedCategory,
  });

  return updatedCategory;
};

export const getCategories = async (): Promise<T_Categories[]> => {
  const response = await fetch("https://dummyjson.com/products/categories");

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const categories: T_JsonPlaceholderCategory[] = await response.json();

  const remoteCategories = categories.map((category) => ({
    id: category.slug,
    name: category.name,
    slug: category.slug,
    status: "active",
  }));
  const overrides = getStoredCategoryOverrides();
  const remoteIds = new Set(remoteCategories.map((category) => category.id));
  const updatedCategories = remoteCategories.map(
    (category) => overrides[category.id] ?? category,
  );
  const createdCategories = Object.values(overrides).filter(
    (category) => !remoteIds.has(category.id),
  );

  return [...createdCategories, ...updatedCategories];
};
