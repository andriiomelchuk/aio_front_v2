type AdminCardProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export const AdminCard = ({
  title,
  description,
  children,
}: AdminCardProps) => {
  return (
    <section className="rounded-md border border-border bg-surface p-4 shadow-sm shadow-shadow-color">
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-foreground">
              {title}
            </h3>
          )}

          {description && (
            <p className="mt-1 text-sm text-muted">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
};