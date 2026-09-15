import { AssignedMenu } from "@/components/Menu";

export const Footer = () => {

  const year = new Date().getFullYear();

  return (
    <footer className="min-h-[var(--footer-height)] border-t border-border bg-surface">
      <div className="mx-auto flex min-h-[var(--footer-height)] flex-col items-center justify-between gap-4 px-4 py-4 text-xs text-muted sm:flex-row sm:flex-wrap sm:px-6 lg:px-8">
        <span>AIO Front</span>
        <AssignedMenu target={{ type: "global" }} region="footer" orientation="horizontal" />
        <span>{year}</span>
      </div>
    </footer>
  );
};
