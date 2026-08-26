"use client";

import { useEffect, useState } from "react";
import { CardShell } from "./CardShell";
import { PlayerCard } from "./PlayerCard";
import { useSearchParams } from "next/navigation";
import type { T_BattleState } from "./types";
import Loader from "@/shared/ui/Loader/Loader";
import { PlayerInfoBlock } from "./PlayerInfoBlock";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { makeBattle } from "@/lib/github";
import { useI18n } from "@/shared/i18n";

export const ResultBattle = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const plOne = params.get("playerone");
  const plTwo = params.get("playertwo");
  const { t } = useI18n();

  const [battleState, setBattleState] = useState<T_BattleState>({
    winner: null,
    loser: null,
    error: null,
  });

  useEffect(() => {
    if (!plOne || !plTwo) {
      return;
    }

    let isCancelled = false;

    makeBattle([plOne, plTwo])
      .then(([winner, loser]) => {
        if (isCancelled) return;

        setBattleState({
          winner,
          loser,
          error: null,
        });
      })
      .catch(() => {
        if (isCancelled) return;

        setBattleState({
          winner: null,
          loser: null,
          error: "ghBattle.resultLoadError",
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [plOne, plTwo]);

  const isLoadingResult =
    Boolean(plOne && plTwo) &&
    !battleState.error &&
    (!battleState.winner || !battleState.loser);

  if (battleState.error) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-4 text-center sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          {t("ghBattle.errorTitle")}
        </h2>

        <p className="mt-2 text-sm text-muted">{t(battleState.error)}</p>
      </div>
    );
  }

  if (isLoadingResult) {
    return <Loader />;
  }

  if (!battleState.winner || !battleState.loser) {
    return null;
  }

  const { winner, loser } = battleState;

  return (
    <div className="flex flex-col items-center">
      <PageHeader
        eyebrow={t("ghBattle.resultEyebrow")}
        title={t("ghBattle.resultTitle")}
        description={t("ghBattle.resultDescription")}
      />
      <div className="mt-10 flex flex-col items-center justify-center gap-5 lg:flex-row">
        <div className="w-full max-w-72 lg:w-auto">
          <CardShell>
            <PlayerCard
              name={
                winner.profile.name ||
                winner.profile.login ||
                t("ghBattle.unknown")
              }
              img={winner.profile.avatar_url || ""}
              label={t("ghBattle.winnerLabel")}
            >
              <PlayerInfoBlock
                profile={winner.profile}
                score={winner.score}
              ></PlayerInfoBlock>
            </PlayerCard>
          </CardShell>
        </div>
        <div className="w-full max-w-72 lg:w-auto">
          <CardShell>
            <PlayerCard
              name={
                loser.profile.name ||
                loser.profile.login ||
                t("ghBattle.unknown")
              }
              img={loser.profile.avatar_url || ""}
              label={t("ghBattle.loserLabel")}
            >
              <PlayerInfoBlock
                profile={loser.profile}
                score={loser.score}
              ></PlayerInfoBlock>
            </PlayerCard>
          </CardShell>
        </div>
      </div>
    </div>
  );
};
