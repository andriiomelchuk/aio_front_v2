import type { T_CreateOrderDto } from "@/entities/order";
import { calculateCartTotals, getCartItemPricing, getCartItemVariant, type T_CartItem } from "@/features/cart";
import type { T_CheckoutFormValues } from "./checkoutSchema";
import { getCheckoutDeliveryFee } from "./getCheckoutDeliveryFee";

export const createOrderDto = (
  values: T_CheckoutFormValues,
  cartItems: T_CartItem[],
  customerId?: string,
): T_CreateOrderDto => {
  if (cartItems.length === 0) {
    throw new Error("Cannot create an order from an empty cart");
  }

  const currencies = new Set(
    cartItems.map(({ product }) => product.currency),
  );

  if (currencies.size > 1) {
    throw new Error("Cannot create an order with multiple currencies");
  }

  const { subtotal, discount, itemsTotal } = calculateCartTotals(cartItems);
  const deliveryFee = getCheckoutDeliveryFee(values.deliveryMethod);
  const total = itemsTotal + deliveryFee;
  const currency = cartItems[0]?.product.currency ?? "USD";

  return {
    price: total,
    ...(customerId ? { customerId } : {}),
    currency,
    customer: {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
    },
    items: cartItems.map((cartItem) => {
      const { product, quantity, variantId } = cartItem;
      const variant = getCartItemVariant(cartItem);
      const pricing = getCartItemPricing(cartItem);

      return {
        productId: product.id,
        variantId,
        title: variant ? `${product.title} / ${variant.title}` : product.title,
        sku: variant?.sku ?? product.sku,
        thumbnail: product.thumbnail,
        quantity,
        baseUnitPrice: pricing.oldPrice ?? pricing.price,
        unitPrice: pricing.price * (1 - (pricing.discountPercentage ?? 0) / 100),
        currency: product.currency,
      };
    }),
    delivery: {
      method: values.deliveryMethod,
      fee: deliveryFee,
      ...(values.deliveryMethod === "courier"
        ? {
            address: {
              country: values.country,
              city: values.city,
              postalCode: values.postalCode,
              address: values.address,
            },
          }
        : {}),
    },
    payment: {
      method: values.paymentMethod,
      status: "pending",
    },
    totals: {
      subtotal,
      discount,
      delivery: deliveryFee,
      total,
    },
    comment: values.comment || undefined,
  };
};
