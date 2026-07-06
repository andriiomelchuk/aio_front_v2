import type { T_SwitchProps } from "./types";

export const Switch = ({
  label,
  description,
  error,
  className = "",
  id,
  ...props
}: T_SwitchProps) => {
  const switchId = id ?? props.name;

  return (
    <div>
      <label
        htmlFor={switchId}
        className={[
          "flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-background p-3 transition",
          "hover:bg-surface-muted",
          className,
        ].join(" ")}
      >
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

        <input
          id={switchId}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />

        <span
          aria-hidden="true"
          className={[
            "relative h-6 w-11 shrink-0 rounded-full bg-surface-strong transition",
            "after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-background after:transition",
            "peer-checked:bg-accent peer-checked:after:translate-x-5",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          ].join(" ")}
        />
      </label>

      {error && (
        <span className="mt-1 block text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
};