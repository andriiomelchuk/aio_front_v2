export const Footer = () => {

  const year = new Date().getFullYear();

  return (
    <footer className="h-[var(--footer-height)] border-t border-border bg-surface">
      <div className="mx-auto flex h-full items-center justify-between px-4 text-xs text-muted sm:px-6 lg:px-8">
        <span>AIO Front</span>
        <span>{year}</span>
      </div>
    </footer>
  );
};