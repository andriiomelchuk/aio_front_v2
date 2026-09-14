import type { T_CustomerAddress } from "@/entities/customer";

export type T_AccountSection = "profile" | "orders" | "addresses" | "settings";

export type T_AddressFormProps = {
  address?: T_CustomerAddress;
  onCancel: () => void;
  onSave: (address: T_CustomerAddress) => Promise<void>;
};
