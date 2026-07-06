import { Field } from "../Field";
import { T_InputProps } from "./types";

export const Input = ({
  className = "",
  variant = "default",
  error,
  id,
  label,
  type = "text",
  ...props
}: T_InputProps) => {
  const variantClass =
    variant === "ghost"
      ? "bg-transparent px-0 py-0"
      : "rounded-md border border-border bg-surface-muted px-3 py-2 focus:border-accent";

  const inputId = id ?? props.name;

  return (
     <Field label={label} error={error} htmlFor={inputId}>
      <input
        id={inputId}
        className={`text-sm text-foreground outline-none transition placeholder:text-muted ${variantClass} ${className}`}
        type={type}
        {...props}
      />
    </Field>
    // <>
    //   <input
    //     className={`text-sm text-foreground outline-none transition placeholder:text-muted ${variantClass} ${className}`}
    //     type={type}
    //     {...props}
    //   />
    //   {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    // </>
  );
};
