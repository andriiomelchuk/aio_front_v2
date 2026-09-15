export type T_ContentReferenceOption = {
  value: string;
  label: string;
  description?: string;
};

export type T_ContentReferenceSelectorProps = {
  type: "products" | "categories";
  selectedValues: string[];
  onChange: (values: string[]) => void;
};
