export const PageLoading = () => (
  <div
    aria-busy="true"
    aria-live="polite"
    className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
  >
    <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
    <div className="mt-4 h-9 w-full max-w-md animate-pulse rounded bg-surface-muted" />
    <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-muted" />
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-lg border border-border bg-surface" />
      ))}
    </div>
  </div>
);
