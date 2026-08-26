import { Avatar } from "@/shared/ui/Avatar";
import type { T_PlayerLoadingProps } from "./types";
import { useI18n } from "@/shared/i18n";

export const PlayerLoading = ({ label }: T_PlayerLoadingProps) => {
   const { t } = useI18n();
  return (
    <div className="flex h-full flex-col justify-between items-center">
      <label className="my-5 flex h-5 justify-center text-sm font-medium text-muted">
        {label}
      </label>

      <Avatar alt={t("ghBattle.loadingPlayerAlt")} size="mid" />

      <div>
        <div className="flex h-20 items-center text-xs font-semibold uppercase tracking-normal text-accent">
          {t("ghBattle.searchingPlayerLabel")}
        </div>
      </div>

      <div className="h-20 flex flex-col justify-center items-end">
        <div className="flex h-10 min-w-50 items-center justify-center text-xs text-muted">
          <span>{t("ghBattle.loadingPlayer")}</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
          <div className="h-full min-w-50 w-1/2 animate-pulse rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
};
