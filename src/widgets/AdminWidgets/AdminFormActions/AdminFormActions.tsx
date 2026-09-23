import { Button } from "@/shared/ui";
import type { T_AdminFormActionsProps } from "./types";

export const AdminFormActions = ({
  cancelLabel,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  isSubmitDisabled = false,
  showSubmit = true,
  isSticky = false,
  onCancel,
}: T_AdminFormActionsProps) => (
  <div
    className={[
      "flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end",
      isSticky ? "sticky bottom-0 z-20 -mx-4 bg-background/95 px-4 pb-4 backdrop-blur sm:-mx-6 sm:px-6" : "",
    ].join(" ")}
  >
    <Button
      type="button"
      variant="secondary"
      className="h-10 w-full sm:w-auto"
      disabled={isSubmitting}
      onClick={onCancel}
    >
      {cancelLabel}
    </Button>
    {showSubmit ? (
      <Button
        type="submit"
        className="h-10 w-full sm:w-auto"
        disabled={isSubmitting || isSubmitDisabled}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? submittingLabel ?? submitLabel : submitLabel}
      </Button>
    ) : null}
  </div>
);
