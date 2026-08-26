import { Button } from "@/shared/ui/Button";
import { CardShell } from "./CardShell";
import { PlayerCard } from "./PlayerCard";
import { PlayerInput } from "./PlayerInput";
import { PlayerLoading } from "./PlayerLoading";
import type { T_PlayerSlotProps } from "./types";
import { useI18n } from "@/shared/i18n";

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
  const { t } = useI18n();

  return (
    <CardShell variant={isLoading ? "loading" : img ? "ready" : "empty"}>
      {isLoading ? (
        <PlayerLoading label={label} />
      ) : img ? (
        <PlayerCard name={name} img={img} label={label}>
          <div className="flex h-20 w-full flex-col items-center justify-center">
            <div className="flex text-xs font-semibold uppercase tracking-normal text-accent">
              {t("ghBattle.readyPlayerLabel")}
            </div>
            <div className="flex h-20 w-full items-end justify-center">
              <Button
                variant="ghost"
                className="mt-6 h-10 w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-danger hover:bg-danger-soft hover:text-danger"
                onClick={() => onDelete(playerId)}
              >
                {t("ghBattle.changePlayerButton")}
              </Button>
            </div>
          </div>
        </PlayerCard>
      ) : (
        <PlayerInput playerId={playerId} label={label} onSubmit={onSubmit} />
      )}
    </CardShell>
  );
};
