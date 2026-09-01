import type {
  T_CreateProductDto,
  T_ProductAttribute,
  T_ProductCurrency,
  T_ProductImage,
  T_ProductStatus,
  T_ProductStockStatus,
  T_ProductVariant,
} from "@/entities/product/model/types";

const getStringValue = (formData: FormData, key: string) => {
  return String(formData.get(key) ?? "").trim();
};

const getNumberValue = (formData: FormData, key: string) => {
  const value = formData.get(key);

  if (!value) {
    return undefined;
  }

  return Number(value);
};

const getImagesValue = (formData: FormData): T_ProductImage[] => {
  const rawImages = getStringValue(formData, "images");

  try {
    const images = JSON.parse(rawImages) as T_ProductImage[];

    if (Array.isArray(images)) {
      return images;
    }

    return [];
  } catch {
    return [];
  }
};

const getAttributesValue = (formData: FormData): T_ProductAttribute[] => {
  const rawAttributes = getStringValue(formData, "attributes");

  try {
    const attributes = JSON.parse(rawAttributes) as T_ProductAttribute[];

    if (Array.isArray(attributes)) {
      return attributes
        .map((attribute) => ({
          name: String(attribute.name ?? "").trim(),
          value: String(attribute.value ?? "").trim(),
        }))
        .filter((attribute) => attribute.name || attribute.value);
    }
  } catch {
    return [];
  }

  return [];
};

const getVariantsValue = (formData: FormData): T_ProductVariant[] | undefined => {
  const rawVariants = getStringValue(formData, "variants");

  try {
    const variants = JSON.parse(rawVariants) as T_ProductVariant[];

    if (Array.isArray(variants)) {
      const preparedVariants = variants
        .map((variant) => ({
          id: String(variant.id ?? "").trim(),
          title: String(variant.title ?? "").trim(),
          sku: String(variant.sku ?? "").trim(),
          price: Number(variant.price) || 0,
          oldPrice: variant.oldPrice ? Number(variant.oldPrice) : undefined,
          discountPercentage: variant.discountPercentage
            ? Number(variant.discountPercentage)
            : undefined,
          stockQuantity: Number(variant.stockQuantity) || 0,
          stockStatus: variant.stockStatus,
          attributes: Array.isArray(variant.attributes)
            ? variant.attributes
                .map((attribute) => ({
                  name: String(attribute.name ?? "").trim(),
                  value: String(attribute.value ?? "").trim(),
                }))
                .filter((attribute) => attribute.name || attribute.value)
            : [],
        }))
        .filter((variant) => variant.title || variant.sku);

      return preparedVariants.length > 0 ? preparedVariants : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

export const getProductFormValues = (
  form: HTMLFormElement
): T_CreateProductDto => {
  const formData = new FormData(form);

  return {
    title: getStringValue(formData, "title"),
    slug: getStringValue(formData, "slug"),
    sku: getStringValue(formData, "sku"),
    brand: getStringValue(formData, "brand"),
    categoryId: getStringValue(formData, "categoryId"),

    status: getStringValue(formData, "status") as T_ProductStatus,

    shortDescription: getStringValue(formData, "shortDescription"),
    description: getStringValue(formData, "description"),

    price: getNumberValue(formData, "price") ?? 0,
    oldPrice: getNumberValue(formData, "oldPrice"),
    discountPercentage: getNumberValue(formData, "discountPercentage"),

    currency: getStringValue(formData, "currency") as T_ProductCurrency,

    stockQuantity: getNumberValue(formData, "stockQuantity") ?? 0,
    stockStatus: getStringValue(
      formData,
      "stockStatus"
    ) as T_ProductStockStatus,

    thumbnail: getStringValue(formData, "thumbnail"),

    images: getImagesValue(formData),
    attributes: getAttributesValue(formData),
    variants: getVariantsValue(formData),

    seo: {
      title: getStringValue(formData, "seoTitle"),
      description: getStringValue(formData, "seoDescription"),
      keywords: getStringValue(formData, "seoKeywords")
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    },

    shipping: {
      weight: getNumberValue(formData, "weight"),
      width: getNumberValue(formData, "width"),
      height: getNumberValue(formData, "height"),
      depth: getNumberValue(formData, "depth"),
    },
  };
};
