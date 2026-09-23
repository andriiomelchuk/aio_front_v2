"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/shared/i18n";
import type { T_ModalProps } from "./types";

export const Modal = ({ isOpen, title, children, onClose }: T_ModalProps) => {
  const titleId = useId();
  const { t } = useI18n();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[calc(100vh-48px)] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-5 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-muted transition hover:bg-surface-muted hover:text-foreground"
            aria-label={t("common.closeModal")}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
