export type T_ContentPageBuilderProps =
  | { mode: "create"; pageId?: never }
  | { mode: "edit"; pageId: string };
