import type { T_Product } from "@/entities/product/model/types";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { toggleProductInComparison } from "./comparisonSlice";


export const useCompare = () => {

  const dispatch = useAppDispatch();

  const products = useAppSelector((state) => state.comparison.products);

  const isInCompare = (productId: string) => {
    return products.some((product) => product.id === productId);
  }

  const toggleProductInCompare = (product: T_Product) => {
    dispatch(toggleProductInComparison(product));
  }

  return {
    products,
    toggleProductInCompare,
    isInCompare
  };
}