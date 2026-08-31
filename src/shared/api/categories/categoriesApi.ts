import type {
  T_Categories,
  T_CreateCategoryDto,
  T_UpdateCategoryDto,
} from "@/entities/categories/model/types";
import type { T_JsonPlaceholderCategory } from "./types";

export const createCategory = async (category: T_CreateCategoryDto) => {
  console.log("Create category request:", category);

  return {
    id: category.slug,
    ...category,
  };
};

export const updateCategory = async (category: T_UpdateCategoryDto) => {
  console.log("Update category request:", category);

  return category;
};

export const getCategories = async (): Promise<T_Categories[]> => {
  const response = await fetch("https://dummyjson.com/products/categories");

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const categories: T_JsonPlaceholderCategory[] = await response.json();

  return categories.map((category) => ({
    id: category.slug,
    name: category.name,
    slug: category.slug,
    status: "active",
  }));
};
