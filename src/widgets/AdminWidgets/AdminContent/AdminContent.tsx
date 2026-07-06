export const AdminContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-background px-4 py-6 lg:px-6">
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </main>
  );
};
