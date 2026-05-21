"use client";

import { useEffect, useState } from "react";
import { CardShell } from "./CardShell";
import { PlayerCard } from "./PlayerCard";
import { useSearchParams } from "next/navigation";
import { makeBattle } from "@/lib/api";
import { T_BattleResult } from "./types";
import Loader from "@/shared/ui/Loader/Loader";
import { PlayerInfoBlock } from "./PlayerInfoBlock";

export const ResultBattle = () => {
  const [winner, setWinner] = useState<T_BattleResult | null>(null);
  const [loser, setLoser] = useState<T_BattleResult | null>(null);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const plOne = params.get("playerone");
  const plTwo = params.get("playertwo");

  useEffect(() => {
    if (!plOne || !plTwo) {
      return;
    }
    makeBattle([plOne, plTwo]).then(
      ([winner, loser]) => {
        setWinner(winner);
        setLoser(loser);
      },
    );
  }, [plOne, plTwo]);

  if (!winner || !loser) {
    return <Loader></Loader>;
  }

  return (
    <div className="flex justify-center flex-col">
      <div>Result</div>
      <div className="players flex  justify-center items-center">
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
