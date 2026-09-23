export type T_DummyJsonProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type T_DummyJsonProduct = {
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
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: "In Stock" | "Low Stock" | "Out of Stock";
  reviews: T_DummyJsonProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string };
  thumbnail: string;
  images: string[];
};

export type T_DummyJsonProductsResponse = {
  products: T_DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
};
