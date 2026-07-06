import type { T_CheckboxProps } from "./types";

export const Checkbox = ({
  label,
  description,
  error,
  className = "",
  id,
  ...props
}: T_CheckboxProps) => {
  const checkboxId = id ?? props.name;

  return (
    <div>
      <label
        htmlFor={checkboxId}
        className={[
          "flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-3 transition",
          "hover:bg-surface-muted",
          className,
        ].join(" ")}
      >
        <input
          id={checkboxId}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
          {...props}
        />

        <span>
          <span className="block text-sm font-medium text-foreground">
            {label}
          </span>

          {description && (
            <span className="mt-1 block text-sm text-muted">
              {description}
            </span>
          )}
        </span>
      </label>

      {error && (
        <span className="mt-1 block text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
};