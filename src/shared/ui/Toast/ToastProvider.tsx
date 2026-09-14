"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  CircleAlert,
  CircleX,
  Info,
  X,
} from "lucide-react";
import type {
  T_ShowToastOptions,
  T_Toast,
  T_ToastContext,
  T_ToastVariant,
} from "./types";
import { useI18n } from "@/shared/i18n";

const ToastContext = createContext<T_ToastContext | null>(null);

const toastVariantView: Record<
  T_ToastVariant,
  { className: string; icon: typeof CheckCircle2 }
> = {
  success: { className: "text-accent", icon: CheckCircle2 },
  info: { className: "text-foreground", icon: Info },
  warning: { className: "text-yellow-500", icon: CircleAlert },
  error: { className: "text-danger", icon: CircleX },
};

const createToastId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<T_Toast[]>([]);

  const removeToast = useCallback((toastId: string) => {
    setToasts((current) => current.filter(({ id }) => id !== toastId));
  }, []);

  const showToast = useCallback(
    ({ message, variant = "success", duration = 3000 }: T_ShowToastOptions) => {
      const id = createToastId();

      setToasts((current) =>
        [...current, { id, message, variant }].slice(-4),
      );
      window.setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col-reverse gap-2 sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:w-full sm:max-w-sm sm:flex-col"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const { className, icon: Icon } = toastVariantView[toast.variant];

          return (
            <div
              key={toast.id}
              role={toast.variant === "error" ? "alert" : "status"}
              className="pointer-events-auto flex min-h-14 items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-lg"
            >
              <Icon
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 ${className}`}
              />
              <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-surface-muted hover:text-foreground"
                aria-label={t("notifications.close")}
                onClick={() => removeToast(toast.id)}
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};
