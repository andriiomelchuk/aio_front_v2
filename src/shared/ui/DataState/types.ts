export type T_DataStateVariant = "loading" | "error" | "empty";

export type T_DataStateProps = {
  variant: T_DataStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
};
