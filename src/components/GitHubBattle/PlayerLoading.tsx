import { Avatar } from "@/shared/ui/Avatar";
import { T_PlayerLoadingProps } from "./types";

export const PlayerLoading = ({ label }: T_PlayerLoadingProps) => {
  return (
    <div className="flex h-full flex-col justify-between items-center">
      <label className="text-sm font-medium text-zinc-300 flex justify-center h-5 my-5">
        {label}
      </label>

      <Avatar alt="loading player" size="mid" />

      <div>
        <div className="h-20 flex items-center text-xs font-semibold uppercase tracking-normal text-green-400">
          Searching
        </div>
      </div>

      <div className="h-20 flex flex-col justify-center items-end">
        <div className="min-w-50 h-10 flex justify-center items-center text-xs text-zinc-500">
          <span>Loading profile... Please wait</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full min-w-50 w-1/2 animate-pulse rounded-full bg-green-500" />
        </div>
      </div>
    </div>
  );
};
