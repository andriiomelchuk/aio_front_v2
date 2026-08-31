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

const getLinesValue = (formData: FormData, key: string) => {
  return getStringValue(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const getImagesValue = (formData: FormData): T_ProductImage[] => {
  const thumbnail = getStringValue(formData, "thumbnail");

  return getLinesValue(formData, "images").map((url, index) => ({
    id: `${index}-${url}`,
    url,
    alt: getStringValue(formData, "title"),
    isMain: url === thumbnail || index === 0,
  }));
};

const getAttributesValue = (formData: FormData): T_ProductAttribute[] => {
  return getLinesValue(formData, "attributes").map((line) => {
    const [name, ...valueParts] = line.split(":");

    return {
      name: name.trim(),
      value: valueParts.join(":").trim(),
    };
  });
};

const getVariantsValue = (formData: FormData): T_ProductVariant[] | undefined => {
  const variants = getLinesValue(formData, "variants").map((line, index) => {
    const [title, sku] = line.split("|").map((value) => value.trim());

    return {
      id: `${index}-${sku || title}`,
      title: title || sku,
      sku: sku || title,
      price: getNumberValue(formData, "price") ?? 0,
      oldPrice: getNumberValue(formData, "oldPrice"),
      discountPercentage: getNumberValue(formData, "discountPercentage"),
      stockQuantity: getNumberValue(formData, "stockQuantity") ?? 0,
      stockStatus: getStringValue(
        formData,
        "stockStatus"
      ) as T_ProductStockStatus,
      attributes: [],
    };
  });

  return variants.length > 0 ? variants : undefined;
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
