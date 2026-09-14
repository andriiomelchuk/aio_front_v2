export default function ProductsLoading() {
  return (
    <main
      className="mx-auto w-full max-w-7xl animate-pulse px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      aria-busy="true"
      aria-label="Loading products"
    >
      <div className="h-4 w-32 rounded bg-surface-strong" />
      <div className="mt-3 h-9 w-64 rounded bg-surface-strong" />
      <div className="mt-8 h-32 rounded-md bg-surface-muted" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="aspect-[3/4] rounded-md bg-surface-muted" />
        ))}
      </div>
    </main>
  );
}
