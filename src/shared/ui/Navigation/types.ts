import { T_I18nKey } from "@/shared/i18n";

export type T_NavItem = {
  id: string;
  labelKey: T_I18nKey;
  href: string;
};

export type T_NavigationProps = {
  items?: T_NavItem[],
  direction?: "row" | "column";
  onNavigate?: () => void;
};