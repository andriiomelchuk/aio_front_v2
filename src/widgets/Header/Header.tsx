import { Navigation } from "@/shared/ui/Navigation";

export const Header = () => {
  return (
    <header className="h-[var(--header-height)] border-b border-border bg-surface">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="text-sm font-semibold text-foreground">
          AIO Front
        </div>

        <Navigation/>
      </div>
    </header>
  );
};
