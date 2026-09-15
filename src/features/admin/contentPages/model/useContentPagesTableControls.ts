import type { T_ContentPageStatus } from "@/entities/contentPage";
import { useTableControls } from "@/hooks";
import type { T_ContentPagesSort } from "./types";

export const useContentPagesTableControls = () =>
  useTableControls<T_ContentPageStatus | "all", T_ContentPagesSort>({
    initialStatus: "all",
    initialSort: "updated-desc",
    initialPageSize: 5,
  });
