import { ButtonHTMLAttributes } from "react"


export type T_ButtonTypes = ButtonHTMLAttributes<HTMLButtonElement> & {
    label?: string,
    type?: "submit" | "button" | "reset",
    variant?: "default" | "secondary" | "danger" | "success" | "warning" | "ghost" | "invisible",
}
