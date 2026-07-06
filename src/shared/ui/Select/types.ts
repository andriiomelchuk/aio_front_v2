import { SelectHTMLAttributes } from "react";

export type T_SelectOptions = {
    value: string;
    label: string;
};

export type T_SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    options: T_SelectOptions[];
    error?: string;
    variant?: "default" | "ghost";
};