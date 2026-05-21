import { CardShell } from "./CardShell";
import { PlayerCard } from "./PlayerCard";
import { PlayerInput } from "./PlayerInput";
import { PlayerLoading } from "./PlayerLoading";
import { T_PlayerSlotProps } from "./types";

export const PlayerSlot = ({
  playerId,
  label,
  name,
  img,
  loadingPlayer,
  onDelete,
  onSubmit,
}: T_PlayerSlotProps) => {
  const isLoading = loadingPlayer === playerId;

  return (
    <CardShell variant={isLoading ? "loading" : img ? "ready" : "empty"}>
      {isLoading ? (
        <PlayerLoading label={label} />
      ) : img ? (
        <PlayerCard
          name={name}
          img={img}
          label={label}
        >
          <div className="h-20  flex justify-center items-center flex-col">
            <div className="text-xs font-semibold uppercase tracking-normal text-green-400 flex">
              Ready
            </div>
            <div className="h-20  flex justify-center items-end">
              <button
                className="h-10 min-w-50 mt-6 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300"
                onClick={() => onDelete(playerId)}
              >
                Change player
              </button>
            </div>
          </div>
        </PlayerCard>
      ) : (
        <PlayerInput playerId={playerId} label={label} onSubmit={onSubmit} />
      )}
    </CardShell>
  );
};
