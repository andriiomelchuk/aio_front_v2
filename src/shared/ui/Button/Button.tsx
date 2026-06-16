import { T_ButtonTypes } from "./types";

const variants = {
  default: "bg-accent text-background hover:opacity-85",
  danger: "bg-danger text-background hover:opacity-85",
  success: "bg-green-600 text-white hover:bg-green-700",
  warning: "bg-yellow-400 text-black hover:bg-yellow-500",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted",
  invisible: "bg-transparent text-foreground"
};

export const Button = ({
  children,
  className = "",
  label,
  variant = "default",
  type = "submit",
  ...props
}: T_ButtonTypes) => {
  return (
    <button
      type={type}
      className={`rounded-md px-4 transition disabled:opacity-50 cursor-pointer
      ${variants[variant]} ${className}`}
      {...props}
    >
      {children ?? label}
    </button>
  );
};
