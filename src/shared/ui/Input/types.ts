import { InputHTMLAttributes } from "react";

export type T_InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "ghost";
};