import type { T_ContentPageStatus } from "@/entities/contentPage";
import type { T_ContentPagesSort } from "../../model";

export type T_ContentPagesTableControls = {
  search: string;
  status: T_ContentPageStatus | "all";
  sort: T_ContentPagesSort;
  hasActiveControls: boolean;
  setSearch: (value: string) => void;
  setStatus: (value: T_ContentPageStatus | "all") => void;
  setSort: (value: T_ContentPagesSort) => void;
  resetControls: () => void;
};

export type T_ContentPagesToolbarProps = {
  controls: T_ContentPagesTableControls;
  canManage: boolean;
  onCreate: () => void;
};
