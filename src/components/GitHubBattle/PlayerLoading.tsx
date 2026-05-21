import { Avatar } from "@/shared/ui/Avatar";
import { T_PlayerLoadingProps } from "./types";

export const PlayerLoading = ({ label }: T_PlayerLoadingProps) => {
  return (
    <div className="flex h-full flex-col justify-between items-center">
      <label className="my-5 flex h-5 justify-center text-sm font-medium text-muted">
        {label}
      </label>

      <Avatar alt="loading player" size="mid" />

      <div>
        <div className="flex h-20 items-center text-xs font-semibold uppercase tracking-normal text-accent">
          Searching
        </div>
      </div>

      <div className="h-20 flex flex-col justify-center items-end">
        <div className="flex h-10 min-w-50 items-center justify-center text-xs text-muted">
          <span>Loading profile... Please wait</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
          <div className="h-full min-w-50 w-1/2 animate-pulse rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
};
