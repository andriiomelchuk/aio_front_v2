import { PlayerLoadingProps } from "./types";

export const PlayerLoading = ({label}: PlayerLoadingProps) => {
    return (
    <>
      <div>
        <div className="h-24 w-24 mb-5 animate-pulse rounded-full border border-zinc-700 bg-zinc-800" />

        <div className="text-sm font-medium text-zinc-300">{label}</div>

        <div className="mt-3 text-xs font-semibold uppercase tracking-normal text-green-400">
          Searching
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs text-zinc-500">
          <span>Loading profile</span>
          <span>Please wait</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-green-500" />
        </div>
      </div>
    </>
  );
}