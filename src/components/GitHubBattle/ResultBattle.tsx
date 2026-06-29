"use client";

import { useEffect, useState } from "react";
import { CardShell } from "./CardShell";
import { PlayerCard } from "./PlayerCard";
import { useSearchParams } from "next/navigation";
import { T_BattleResult, T_BattleState } from "./types";
import Loader from "@/shared/ui/Loader/Loader";
import { PlayerInfoBlock } from "./PlayerInfoBlock";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { makeBattle } from "@/lib/github";

export const ResultBattle = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const plOne = params.get("playerone");
  const plTwo = params.get("playertwo");

  const [battleState, setBattleState] = useState<T_BattleState>({
    winner: null,
    loser: null,
    error: null,
    isLoading: false,
  });

  useEffect(() => {
    if (!plOne || !plTwo) {
      return;
    }

    let isCancelled = false;

    setBattleState({
      winner: null,
      loser: null,
      error: null,
      isLoading: true,
    });

    makeBattle([plOne, plTwo])
      .then(([winner, loser]) => {
        if (isCancelled) return;

        setBattleState({
          winner,
          loser,
          error: null,
          isLoading: false,
        });
      })
      .catch(() => {
        if (isCancelled) return;

        setBattleState({
          winner: null,
          loser: null,
          error: "Could not load battle result",
          isLoading: false,
        });
      });
      
    return () => {
      isCancelled = true;
    };
  }, [plOne, plTwo]);

  if (battleState.error) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Battle result unavailable
        </h2>
        <p>{battleState.error}</p>
        <p className="mt-2 text-sm text-muted">{battleState.error}</p>
      </div>
    );
  }

  if (battleState.isLoading || !battleState.winner || !battleState.loser) {
    return <Loader />;
  }

  const { winner, loser } = battleState;

  return (
    <div className="flex flex-col items-center">
      <PageHeader
        eyebrow="GitHub Battle"
        title="Battle Result"
        description="The winner is calculated from followers and repository stars."
      />
      <div className="players flex  justify-center items-center mt-10">
        <div className="winner mx-5">
          <CardShell>
            <PlayerCard
              name={winner.profile.name || winner.profile.login || "Unknown"}
              img={winner.profile.avatar_url || ""}
              label="Winner"
            >
              <PlayerInfoBlock
                profile={winner.profile}
                score={winner.score}
              ></PlayerInfoBlock>
            </PlayerCard>
          </CardShell>
        </div>
        <div className="loser mx-5">
          <CardShell>
            <PlayerCard
              name={loser.profile.name || loser.profile.login || "Unknown"}
              img={loser.profile.avatar_url || ""}
              label="Loser"
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
