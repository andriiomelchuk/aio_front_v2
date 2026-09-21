import type {
  T_CreateProductDto,
  T_ProductAttribute,
  T_ProductCurrency,
  T_ProductImage,
  T_ProductStatus,
  T_ProductStockStatus,
  T_ProductVariant,
} from "@/entities/product/model/types";
import { normalizeProductTranslations } from "@/entities/product";
import type { T_Locale } from "@/shared/i18n";

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
          id: attribute.id ? String(attribute.id) : undefined,
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
                  id: attribute.id ? String(attribute.id) : undefined,
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

const getTranslationsValue = (formData: FormData) => {
  try {
    return normalizeProductTranslations(JSON.parse(getStringValue(formData, "translations") || "{}"));
  } catch {
    return {};
  }
};

export const getProductFormValues = (
  form: HTMLFormElement
): T_CreateProductDto => {
  const formData = new FormData(form);
  const defaultLocale = getStringValue(formData, "defaultLocale") as T_Locale;
  const translations = getTranslationsValue(formData);
  const sourceTranslation = translations[defaultLocale];
  const attributes = getAttributesValue(formData);
  const variants = getVariantsValue(formData);
  const images = getImagesValue(formData);
  const sourceAttributes = attributes.map((attribute, index) => ({
    ...attribute,
    name: (sourceTranslation?.attributes.find((item) => item.sourceId === attribute.id) ?? sourceTranslation?.attributes[index])?.name.trim() || attribute.name,
    value: (sourceTranslation?.attributes.find((item) => item.sourceId === attribute.id) ?? sourceTranslation?.attributes[index])?.value.trim() || attribute.value,
  }));
  const sourceVariants = variants?.map((variant) => {
    const translation = sourceTranslation?.variants[variant.id];
    return {
      ...variant,
      title: translation?.title.trim() || variant.title,
      attributes: variant.attributes.map((attribute, index) => ({
        ...attribute,
        name: (translation?.attributes.find((item) => item.sourceId === attribute.id) ?? translation?.attributes[index])?.name.trim() || attribute.name,
        value: (translation?.attributes.find((item) => item.sourceId === attribute.id) ?? translation?.attributes[index])?.value.trim() || attribute.value,
      })),
    };
  });

  return {
    title: sourceTranslation?.title.trim() || getStringValue(formData, "title"),
    slug: getStringValue(formData, "slug"),
    sku: getStringValue(formData, "sku"),
    brand: getStringValue(formData, "brand"),
    categoryId: getStringValue(formData, "categoryId"),

    status: getStringValue(formData, "status") as T_ProductStatus,

    shortDescription: sourceTranslation?.shortDescription.trim() || getStringValue(formData, "shortDescription"),
    description: sourceTranslation?.description.trim() || getStringValue(formData, "description"),

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

    images: images.map((image) => ({
      ...image,
      alt: sourceTranslation?.imageAlts[image.id]?.trim() || image.alt,
    })),
    attributes: sourceAttributes,
    variants: sourceVariants,

    seo: {
      title: sourceTranslation?.seo.title.trim() || getStringValue(formData, "seoTitle"),
      description: sourceTranslation?.seo.description.trim() || getStringValue(formData, "seoDescription"),
      keywords: sourceTranslation?.seo.keywords.length
        ? sourceTranslation.seo.keywords
        : getStringValue(formData, "seoKeywords")
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
    defaultLocale,
    translations,
  };
};
