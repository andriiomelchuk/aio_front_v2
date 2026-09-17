import { Field } from "../Field";
import type { T_TextareaProps } from "./types";
import { useId } from "react";

export const Textarea = ({
  label,
  error,
  className = "",
  id,
  ...props
}: T_TextareaProps) => {
  const generatedId = useId();
  const textareaId = id ?? props.name ?? generatedId;

  return (
    <Field label={label} error={error} htmlFor={textareaId}>
      <textarea
        id={textareaId}
        className={[
          label ? "mt-1" : "",
          "min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none transition",
          "placeholder:text-muted focus:border-accent disabled:cursor-not-allowed disabled:opacity-60",
          error ? "border-danger" : "border-border",
          className,
        ].join(" ")}
        {...props}
      />
    </Field>
  );
};
