type AdminBadgeVariant = "success" | "warning" | "danger" | "neutral";

type AdminBadgeProps = {
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
};

const variantClasses: Record<AdminBadgeVariant, string> = {
  success: "bg-accent-soft text-accent",
  warning: "bg-surface-muted text-foreground",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface-muted text-muted",
};

export const AdminBadge = ({
  children,
  variant = "neutral",
}: AdminBadgeProps) => {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        variantClasses[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
};