import type { T_FieldProps } from "./types";

export const Field = ({
  label,
  error,
  htmlFor,
  children,
}: T_FieldProps) => {
  return (
    <div className="block">
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      {children}

      {error && (
        <span className="mt-1 block text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
};