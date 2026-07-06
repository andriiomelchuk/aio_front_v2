import type { InputHTMLAttributes } from "react";

export type T_SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  description?: string;
  error?: string;
};