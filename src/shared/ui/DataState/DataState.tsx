"use client";

import { Inbox, LoaderCircle, TriangleAlert } from "lucide-react";
import { useI18n } from "@/shared/i18n";
import { Button } from "../Button";
import type { T_DataStateProps } from "./types";

const icons = {
  loading: LoaderCircle,
  error: TriangleAlert,
  empty: Inbox,
};

export const DataState = ({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
  className = "",
}: T_DataStateProps) => {
  const { t } = useI18n();
  const Icon = icons[variant];
  const resolvedTitle = title ?? t(`common.dataState.${variant}`);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-busy={variant === "loading"}
      className={`flex flex-col items-center justify-center text-center ${compact ? "min-h-28 p-4" : "min-h-48 rounded-md border border-border bg-surface p-6 sm:p-10"} ${className}`}
    >
      <Icon
        aria-hidden="true"
        className={`h-8 w-8 ${variant === "loading" ? "animate-spin text-accent" : variant === "error" ? "text-danger" : "text-muted"}`}
      />
      <p className="mt-3 font-semibold text-foreground">{resolvedTitle}</p>
      {description && <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>}
      {onAction && (
        <Button type="button" variant={variant === "error" ? "secondary" : "default"} className="mt-4 h-10 px-4" onClick={onAction}>
          {actionLabel ?? t("common.dataState.retry")}
        </Button>
      )}
    </div>
  );
};
