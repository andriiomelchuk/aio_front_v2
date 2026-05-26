"use client";

import { useEffect, useState } from "react";
import { CardShell } from "./CardShell";
import { PlayerCard } from "./PlayerCard";
import { useSearchParams } from "next/navigation";
import { makeBattle } from "@/lib/api";
import { T_BattleResult } from "./types";
import Loader from "@/shared/ui/Loader/Loader";
import { PlayerInfoBlock } from "./PlayerInfoBlock";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";

export const ResultBattle = () => {
  const [winner, setWinner] = useState<T_BattleResult | null>(null);
  const [loser, setLoser] = useState<T_BattleResult | null>(null);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const plOne = params.get("playerone");
  const plTwo = params.get("playertwo");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plOne || !plTwo) {
      return;
    }

    setError(null);
    setWinner(null);
    setLoser(null);

    makeBattle([plOne, plTwo])
      .then(([winner, loser]) => {
        setWinner(winner);
        setLoser(loser);
      })
      .catch(() => {
        setError("Could not load battle result");
      });
  }, [plOne, plTwo]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Battle result unavailable
        </h2>

        <p className="mt-2 text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (!winner || !loser) {
    return <Loader></Loader>;
  }

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
