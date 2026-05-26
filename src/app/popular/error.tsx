"use client";

export default function PopularError({
  // error,
  reset,
}: {
  // error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 text-center">
      <h2 className="text-xl font-semibold text-foreground">
        Failed to load repositories
      </h2>

      <p className="mt-2 text-sm text-muted">
        GitHub API is unavailable right now. Please try again.
      </p>

      <button
        className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-background"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
