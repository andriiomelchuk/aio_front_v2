import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCustomer, getCustomerById, updateCustomer } from "./customersApi";
import type { CustomersApiError } from "./types";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
};

beforeEach(() => {
  const storage = createStorage();
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("localStorage", storage);
});

afterEach(() => vi.unstubAllGlobals());

describe("customers API contract", () => {
  it("returns a typed not-found error", async () => {
    await expect(getCustomerById("missing"))
      .rejects.toMatchObject<Partial<CustomersApiError>>({ code: "NOT_FOUND" });
  });

  it("supports partial updates without replacing immutable fields", async () => {
    const customer = await createCustomer({
      type: "individual",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      addresses: [],
      marketingConsent: false,
    });

    const updated = await updateCustomer({ id: customer.id, phone: "+491234" });

    expect(updated).toMatchObject({
      id: customer.id,
      firstName: "Jane",
      email: "jane@example.com",
      phone: "+491234",
      createdAt: customer.createdAt,
    });
  });

  it("returns a typed duplicate-email error", async () => {
    const base = {
      type: "individual" as const,
      lastName: "Doe",
      addresses: [],
      marketingConsent: false,
    };
    await createCustomer({ ...base, firstName: "Jane", email: "jane@example.com" });

    await expect(createCustomer({ ...base, firstName: "John", email: "JANE@example.com" }))
      .rejects.toMatchObject<Partial<CustomersApiError>>({ code: "DUPLICATE_EMAIL" });
  });
});
