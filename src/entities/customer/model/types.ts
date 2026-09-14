export type T_CustomerStatus = "active" | "blocked" | "inactive";
export type T_CustomerType = "individual" | "business";
export type T_CustomerAddressType = "shipping" | "billing";

export type T_CustomerAddress = {
  id: string;
  type: T_CustomerAddressType;
  label: string;
  recipientName: string;
  phone?: string;
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
};

export type T_CustomerCompany = {
  name: string;
  taxId?: string;
};

export type T_CustomerNote = {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
};

export type T_Customer = {
  id: string;
  userId?: string;
  type: T_CustomerType;
  status: T_CustomerStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: T_CustomerCompany;
  addresses: T_CustomerAddress[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  marketingConsent: boolean;
  notes: T_CustomerNote[];
  createdAt: string;
  updatedAt: string;
};

export type T_CreateCustomerDto = Omit<
  T_Customer,
  "id" | "status" | "notes" | "createdAt" | "updatedAt"
> & {
  status?: T_CustomerStatus;
  notes?: T_CustomerNote[];
};

export type T_UpdateCustomerDto = Partial<
  Omit<T_Customer, "id" | "createdAt" | "updatedAt">
> & {
  id: string;
};
