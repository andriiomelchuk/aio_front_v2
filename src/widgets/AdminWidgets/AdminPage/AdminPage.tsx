type AdminPageProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export const AdminPage = ({
  title,
  description,
  actions,
  children,
}: AdminPageProps) => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
};
