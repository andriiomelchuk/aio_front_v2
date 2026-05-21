import { T_CardShellProps } from "./types";

export const CardShell = ({ children, variant = "empty" }: T_CardShellProps) => {
  const borderClass =
    variant === "ready"
      ? "border-green-500/40 shadow-green-950/30"
      : variant === "loading"
        ? "border-green-500/30 shadow-green-950/20"
        : "border-dashed border-zinc-700 shadow-black/20";

  return (
    <div
      className={`flex min-h-96 w-60 flex-col rounded-lg border bg-zinc-950 p-6 shadow-lg justify-center items-center ${borderClass}`}
    >
      {children}
    </div>
  );
};