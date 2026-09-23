export type T_ImagePickerProps = {
  label: string;
  value?: string;
  alt?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
};
