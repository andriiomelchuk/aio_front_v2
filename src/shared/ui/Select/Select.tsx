import { Field } from "../Field";
import type { T_SelectProps } from "./types";

export const Select = ({
  label,
  error,
  options,
  className = "",
  id,
  ...props
}: T_SelectProps) => {
  const selectId = id ?? props.name;

  return (
    <Field error={error} label={label}  htmlFor={selectId}>
      <select
        id={selectId}
        className={[
          label ? "mt-1" : "",
          "h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none transition",
          "focus:border-accent disabled:cursor-not-allowed disabled:opacity-60",
          error ? "border-danger" : "border-border",
          className,
        ].join(" ")}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
};