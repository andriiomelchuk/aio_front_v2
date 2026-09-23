import type {
  T_CreateCustomerDto,
  T_Customer,
  T_CustomerNote,
  T_CustomerStatus,
  T_CustomerType,
  T_UpdateCustomerDto,
} from "@/entities/customer";
import { ApiError } from "@/shared/api/core";

export type T_GetCustomersParams = {
  search?: string;
  status?: T_CustomerStatus;
  type?: T_CustomerType;
};

export type T_CreateCustomerNoteDto = Pick<T_CustomerNote, "text" | "authorName">;

export type T_CustomersApiErrorCode =
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "DUPLICATE_EMAIL"
  | "STORAGE_WRITE_FAILED";

export class CustomersApiError extends ApiError<T_CustomersApiErrorCode> {
  constructor(code: T_CustomersApiErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
    this.name = "CustomersApiError";
  }
}

export type T_CustomersApiContract = {
  getCustomers: (params?: T_GetCustomersParams) => Promise<T_Customer[]>;
  getCustomerById: (id: string) => Promise<T_Customer>;
  createCustomer: (input: T_CreateCustomerDto) => Promise<T_Customer>;
  updateCustomer: (input: T_UpdateCustomerDto) => Promise<T_Customer>;
  deleteCustomer: (id: string) => Promise<string>;
  addCustomerNote: (customerId: string, input: T_CreateCustomerNoteDto) => Promise<T_CustomerNote>;
  deleteCustomerNote: (customerId: string, noteId: string) => Promise<string>;
};
