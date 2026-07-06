import { InputHTMLAttributes } from "react";

export type T_InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "ghost";
  error?: string;
  type: "text" | "password" | "email" | "number" | "url" | "tel" | "search";
  label?: string;
};