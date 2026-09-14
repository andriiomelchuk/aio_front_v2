import type { ReactNode } from "react";

type T_CheckoutSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export const CheckoutSection = ({
  title,
  description,
  children,
}: T_CheckoutSectionProps) => {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
};
