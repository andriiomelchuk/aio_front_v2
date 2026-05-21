import Link from "next/link";

export const Header = () => {
  return (
    <header className="h-[var(--header-height)] border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="text-sm font-semibold text-foreground">
          AIO Front
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link className="text-muted transition hover:text-foreground" href="/">
            Home
          </Link>
          <Link
            className="text-muted transition hover:text-foreground"
            href="/popular"
          >
            Popular
          </Link>
          <Link
            className="text-muted transition hover:text-foreground"
            href="/battle"
          >
            Battle
          </Link>
        </nav>
      </div>
    </header>
  );
};
