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
        <PlayerCard name={name} img={img} label={label}>
          <div className="h-20  flex justify-center items-center flex-col">
            <div className="flex text-xs font-semibold uppercase tracking-normal text-accent">
              Ready
            </div>
            <div className="h-20  flex justify-center items-end">
              <button
                className="mt-6 h-10 min-w-50 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-danger hover:bg-danger-soft hover:text-danger"
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
