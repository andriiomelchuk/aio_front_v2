import Link from "next/link";

type T_AuthFormShellProps = {
  title: string;
  description: string;
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
  children: React.ReactNode;
};

export const AuthFormShell = ({
  title,
  description,
  footerText,
  footerLinkLabel,
  footerHref,
  children,
}: T_AuthFormShellProps) => (
  <section className="mx-auto w-full max-w-md px-4 py-8 sm:px-0 sm:py-12">
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </header>
    <div className="rounded-md border border-border bg-surface p-4 shadow-sm sm:p-6">
      {children}
    </div>
    <p className="mt-5 text-center text-sm text-muted">
      {footerText}{" "}
      <Link className="font-semibold text-accent hover:underline" href={footerHref}>
        {footerLinkLabel}
      </Link>
    </p>
  </section>
);
