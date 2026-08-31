export type T_JsonPlaceholderProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type T_JsonPlaceholderProductDimensions = {
  width: number;
  height: number;
  depth: number;
};

export type T_JsonPlaceholderProductMeta = {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
};

export type T_JsonPlaceholderProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: T_JsonPlaceholderProductDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: "In Stock" | "Low Stock" | "Out of Stock";
  reviews: T_JsonPlaceholderProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: T_JsonPlaceholderProductMeta;
  thumbnail: string;
  images: string[];
};

export type T_JsonPlaceholderProductsResponse = {
  products: T_JsonPlaceholderProduct[];
  total: number;
  skip: number;
  limit: number;
};
