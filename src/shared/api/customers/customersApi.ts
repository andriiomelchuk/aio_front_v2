import type {
  T_CreateCustomerDto,
  T_Customer,
  T_CustomerNote,
  T_UpdateCustomerDto,
} from "@/entities/customer";
import type { T_GetCustomersParams } from "./types";

const CUSTOMERS_STORAGE_KEY = "customers";

const createCustomerId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const loadCustomers = (): T_Customer[] => {
  if (typeof window === "undefined") return [];

  try {
    const customers: unknown = JSON.parse(
      localStorage.getItem(CUSTOMERS_STORAGE_KEY) ?? "[]",
    );

    return Array.isArray(customers)
      ? (customers as T_Customer[]).map((customer) => ({
          ...customer,
          notes: customer.notes ?? [],
        }))
      : [];
  } catch {
    localStorage.removeItem(CUSTOMERS_STORAGE_KEY);
    return [];
  }
};

const saveCustomers = (customers: T_Customer[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
};

const validateCustomerProfile = (customer: T_Customer) => {
  if (!customer.firstName.trim() || !customer.lastName.trim()) {
    throw new Error("Customer name is required");
  }

  if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
    throw new Error("Customer email is invalid");
  }

  if (customer.type === "business" && !customer.company?.name.trim()) {
    throw new Error("Company name is required for a business customer");
  }
};

const validateCustomerAddresses = (
  customer: Pick<
    T_Customer,
    "addresses" | "defaultShippingAddressId" | "defaultBillingAddressId"
  >,
) => {
  const addressIds = customer.addresses.map(({ id }) => id);

  if (new Set(addressIds).size !== addressIds.length) {
    throw new Error("Customer address IDs must be unique");
  }

  const shippingAddress = customer.addresses.find(
    ({ id }) => id === customer.defaultShippingAddressId,
  );
  const billingAddress = customer.addresses.find(
    ({ id }) => id === customer.defaultBillingAddressId,
  );

  if (
    customer.defaultShippingAddressId &&
    shippingAddress?.type !== "shipping"
  ) {
    throw new Error("Default shipping address is invalid");
  }

  if (
    customer.defaultBillingAddressId &&
    billingAddress?.type !== "billing"
  ) {
    throw new Error("Default billing address is invalid");
  }
};

export const getCustomers = async (
  params: T_GetCustomersParams = {},
): Promise<T_Customer[]> => {
  const normalizedSearch = params.search?.trim().toLocaleLowerCase() ?? "";

  return loadCustomers().filter((customer) => {
    const searchableValue = [
      customer.firstName,
      customer.lastName,
      customer.email,
      customer.phone,
      customer.company?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!normalizedSearch || searchableValue.includes(normalizedSearch)) &&
      (!params.status || customer.status === params.status) &&
      (!params.type || customer.type === params.type)
    );
  });
};

export const getCustomerById = async (id: string): Promise<T_Customer> => {
  const customer = loadCustomers().find((item) => item.id === id);

  if (!customer) throw new Error("Customer not found");

  return customer;
};

export const createCustomer = async (
  customer: T_CreateCustomerDto,
): Promise<T_Customer> => {
  const customers = loadCustomers();
  const normalizedEmail = customer.email.trim().toLocaleLowerCase();

  if (customers.some(({ email }) => email.toLocaleLowerCase() === normalizedEmail)) {
    throw new Error("Customer with this email already exists");
  }

  const timestamp = new Date().toISOString();
  const createdCustomer: T_Customer = {
    ...customer,
    id: createCustomerId(),
    email: normalizedEmail,
    status: customer.status ?? "active",
    notes: customer.notes ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  validateCustomerProfile(createdCustomer);
  validateCustomerAddresses(createdCustomer);

  saveCustomers([...customers, createdCustomer]);
  return createdCustomer;
};

export const updateCustomer = async (
  changes: T_UpdateCustomerDto,
): Promise<T_Customer> => {
  const customers = loadCustomers();
  const customerIndex = customers.findIndex(({ id }) => id === changes.id);

  if (customerIndex === -1) throw new Error("Customer not found");

  const currentCustomer = customers[customerIndex];
  const updatedCustomer: T_Customer = {
    ...currentCustomer,
    ...changes,
    email: changes.email?.trim().toLocaleLowerCase() ?? currentCustomer.email,
    id: currentCustomer.id,
    createdAt: currentCustomer.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const hasDuplicateEmail = customers.some(
    ({ id, email }) =>
      id !== updatedCustomer.id &&
      email.toLocaleLowerCase() === updatedCustomer.email.toLocaleLowerCase(),
  );

  if (hasDuplicateEmail) {
    throw new Error("Customer with this email already exists");
  }

  validateCustomerProfile(updatedCustomer);
  validateCustomerAddresses(updatedCustomer);

  customers[customerIndex] = updatedCustomer;
  saveCustomers(customers);
  return updatedCustomer;
};

export const deleteCustomer = async (id: string): Promise<string> => {
  const customers = loadCustomers();

  if (!customers.some((customer) => customer.id === id)) {
    throw new Error("Customer not found");
  }

  saveCustomers(customers.filter((customer) => customer.id !== id));
  return id;
};

export const addCustomerNote = async (
  customerId: string,
  note: Pick<T_CustomerNote, "text" | "authorName">,
): Promise<T_CustomerNote> => {
  const customer = await getCustomerById(customerId);
  const createdNote: T_CustomerNote = {
    ...note,
    id: createCustomerId(),
    text: note.text.trim(),
    authorName: note.authorName.trim(),
    createdAt: new Date().toISOString(),
  };

  if (!createdNote.text) throw new Error("Customer note cannot be empty");

  await updateCustomer({
    id: customerId,
    notes: [createdNote, ...customer.notes],
  });
  return createdNote;
};

export const deleteCustomerNote = async (
  customerId: string,
  noteId: string,
): Promise<string> => {
  const customer = await getCustomerById(customerId);

  if (!customer.notes.some(({ id }) => id === noteId)) {
    throw new Error("Customer note not found");
  }

  await updateCustomer({
    id: customerId,
    notes: customer.notes.filter(({ id }) => id !== noteId),
  });
  return noteId;
};
