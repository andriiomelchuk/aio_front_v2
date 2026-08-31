import { T_Product } from "@/entities/product/model/types";

  export type T_EditProductPageContentProps = {
    product: T_Product;
  };

  export type T_EditProductPageProps = {
    params: Promise<{id: string}>;
};