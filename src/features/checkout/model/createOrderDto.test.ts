import { describe, expect, it } from "vitest";
import type { T_Product } from "@/entities/product";
import type { T_CheckoutFormValues } from "./checkoutSchema";
import { createOrderDto } from "./createOrderDto";

const values: T_CheckoutFormValues = {
  firstName: "Test", lastName: "Customer", email: "test@example.com", phone: "+49123456789",
  deliveryMethod: "pickup", country: "", city: "", postalCode: "", address: "",
  paymentMethod: "card_online", comment: "", acceptTerms: true,
};

const product = {
  id: "product-1", title: "Shampoo", slug: "shampoo", sku: "SHAMPOO", description: "",
  price: 20, currency: "EUR", stockQuantity: 20, stockStatus: "in_stock", categoryId: "care",
  status: "active", thumbnail: "/shampoo.jpg", images: [], attributes: [],
  variants: [{ id: "large", title: "Large", sku: "SHAMPOO-L", price: 30, discountPercentage: 10, stockQuantity: 4, stockStatus: "in_stock", attributes: [] }],
  createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
} satisfies T_Product;

describe("createOrderDto", () => {
  it("keeps selected variant identity and commercial values", () => {
    const order = createOrderDto(values, [{ product, variantId: "large", quantity: 2 }]);

    expect(order.items[0]).toMatchObject({
      productId: "product-1", variantId: "large", title: "Shampoo / Large",
      sku: "SHAMPOO-L", baseUnitPrice: 30, unitPrice: 27, quantity: 2,
    });
  });
});
