export type T_ToastVariant = "success" | "info" | "warning" | "error";

export type T_Toast = {
  id: string;
  message: string;
  variant: T_ToastVariant;
};

export type T_ShowToastOptions = {
  message: string;
  variant?: T_ToastVariant;
  duration?: number;
};

export type T_ToastContext = {
  showToast: (options: T_ShowToastOptions) => void;
};
