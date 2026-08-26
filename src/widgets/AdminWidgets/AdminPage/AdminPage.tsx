import type { T_AdminPageProps } from "./types";

export const AdminPage = ({
  title,
  description,
  actions,
  children,
}: T_AdminPageProps) => {
  const hasHeading = Boolean(title || description);

  return (
    <section className="space-y-6">
      {(hasHeading || actions) && (
        <div
          className={[
            "flex flex-col gap-4 border-b border-border pb-5",
            hasHeading ? "sm:flex-row sm:items-start sm:justify-between" : "",
          ].join(" ")}
        >
          {hasHeading && (
            <div className="min-w-0">
              {title && (
                <h2 className="text-xl font-semibold text-foreground">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
          )}

          {actions && (
            <div
              className={[
                "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap",
                hasHeading ? "sm:w-auto sm:shrink-0" : "",
              ].join(" ")}
            >
              {actions}
            </div>
          )}
        </div>
      )}

      <div>{children}</div>
    </section>
  );
};
