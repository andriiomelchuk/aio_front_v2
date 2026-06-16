import { T_InputProps } from "./types";



export const Input = ({
  className = "",
  variant = "default",
  ...props
}: T_InputProps) => {
  const variantClass =
    variant === "ghost"
      ? "bg-transparent px-0 py-0"
      : "rounded-md border border-border bg-surface-muted px-3 py-2 focus:border-accent";
  return (
    <>
      <input
        className={`text-sm text-foreground outline-none transition placeholder:text-muted ${variantClass} ${className}`}
        type="text"
        {...props}
      />
    </>
  );
};
