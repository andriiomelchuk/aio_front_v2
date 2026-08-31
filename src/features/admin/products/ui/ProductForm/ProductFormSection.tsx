"use client";

import { useState, type ReactNode } from "react";

type T_ProductFormSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export const ProductFormSection = ({
  title,
  children,
  defaultOpen = true,
}: T_ProductFormSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rounded-md border border-border bg-surface shadow-sm shadow-shadow-color">
      <button
        type="button"
        className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-base font-semibold text-foreground transition hover:bg-surface-muted"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span>{title}</span>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-sm text-muted"
          aria-hidden="true"
        >
          {isOpen ? "-" : "+"}
        </span>
      </button>

      {isOpen && <div className="border-t border-border p-4">{children}</div>}
    </section>
  );
};
