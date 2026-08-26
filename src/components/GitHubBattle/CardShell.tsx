import type { T_CardShellProps } from "./types";

export const CardShell = ({ children, variant = "empty" }: T_CardShellProps) => {
  const borderClass =
    variant === "ready"
      ? "border-accent shadow-[0_18px_40px_var(--shadow-color)]"
      : variant === "loading"
        ? "border-accent shadow-[0_18px_40px_var(--shadow-color)]"
        : "border-dashed border-border shadow-[0_18px_40px_var(--shadow-color)]";

  return (
    <div
      className={`flex min-h-96 w-full max-w-72 flex-col items-center justify-center rounded-lg border bg-surface p-6 ${borderClass}`}
    >
      {children}
    </div>
  );
};
