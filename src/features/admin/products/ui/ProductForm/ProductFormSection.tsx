"use client";

import { useId, useState, type ReactNode } from "react";

export type T_ProductFormSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export const ProductFormSection = ({
  title,
  children,
  defaultOpen = true,
  isOpen,
  onOpenChange,
}: T_ProductFormSectionProps) => {
  const sectionId = useId();
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const currentIsOpen = isOpen ?? internalIsOpen;

  const toggleSection = () => {
    const nextIsOpen = !currentIsOpen;

    setInternalIsOpen(nextIsOpen);
    onOpenChange?.(nextIsOpen);
  };

  return (
    <section className="rounded-md border border-border bg-surface shadow-sm shadow-shadow-color">
      <button
        type="button"
        className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-base font-semibold text-foreground transition hover:bg-surface-muted"
        aria-controls={sectionId}
        aria-expanded={currentIsOpen}
        onClick={toggleSection}
      >
        <span>{title}</span>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-sm text-muted"
          aria-hidden="true"
        >
          {currentIsOpen ? "-" : "+"}
        </span>
      </button>

      {currentIsOpen && (
        <div id={sectionId} className="border-t border-border p-4">
          {children}
        </div>
      )}
    </section>
  );
};
