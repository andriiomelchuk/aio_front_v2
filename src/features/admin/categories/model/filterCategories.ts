import { T_Categories, T_CategoriesStatus } from "@/entities/categories/model/types";


export const filterCategories = (categories: T_Categories[], params: {status: T_CategoriesStatus | "all"; search: string}): T_Categories[] => {
    const normalizedSearch = params.search.trim();

  return categories.filter((category) => {
    const matchesStatus =
      params.status === "all" || category.status === params.status;

    const matchesSearch =
      normalizedSearch === "" ||
      category.id.toString().includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });
}
