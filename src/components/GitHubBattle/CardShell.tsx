import { CardShellProps } from "./types";

export const CardShell = ({ children, variant = "empty" }: CardShellProps) => {
  const borderClass =
    variant === "ready"
      ? "border-green-500/40 shadow-green-950/30"
      : variant === "loading"
        ? "border-green-500/30 shadow-green-950/20"
        : "border-dashed border-zinc-700 shadow-black/20";

  return (
    <div
      className={`flex min-h-72 w-50 flex-col justify-between rounded-lg border bg-zinc-950 p-6 shadow-lg justify-center items-center ${borderClass}`}
    >
      {children}
    </div>
  );
};