import type { T_Categories } from "@/entities/categories/model/types";
import type { T_CategoriesSort } from "./types";


export const sortCategories = (
  users: T_Categories[],
  sort: T_CategoriesSort,
): T_Categories[] => {
  const sortedCategories = [...users];

  switch (sort) {
    case "name-asc":
      return sortedCategories.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return sortedCategories.sort((a, b) => b.name.localeCompare(a.name));

    case "status-asc":
      return sortedCategories.sort((a, b) => a.status.localeCompare(b.status));

    default:
      return sortedCategories;
  }
};
