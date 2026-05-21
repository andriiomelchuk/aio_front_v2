type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
};


export const PageHeader = ({ title, description, eyebrow }: PageHeaderProps) => {
  return (
    <header className="mb-8 flex flex-col items-center text-center">
      {eyebrow ? (
        <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
          {eyebrow}
        </span>
      ) : null}

      <h1 className="text-3xl font-semibold text-foreground">
        {title}
      </h1>

      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
      ) : null}

      <div className="mt-4 h-px w-24 bg-accent" />
    </header>
  );
};