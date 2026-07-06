import type { TextareaHTMLAttributes } from "react";

export type T_TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};