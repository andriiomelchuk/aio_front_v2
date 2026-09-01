import type { T_ProductImage } from "@/entities/product/model/types";

export type T_ProductGalleryManagerProps = {
  images?: T_ProductImage[];
  thumbnail?: string;
};