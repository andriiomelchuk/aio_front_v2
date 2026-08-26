"use client";

import { useState } from "react";
import type { T_PlayerData, T_PlayerId } from "./types";
import { PlayerSlot } from "./PlayerSlot";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { Button } from "@/shared/ui/Button";
import { getGithubUser } from "@/lib/github";
import { useI18n } from "@/shared/i18n";

export const GitHub = () => {
  const [playerData, setPlayerData] = useState<T_PlayerData>({
    playerOneName: "",
    playerTwoName: "",
    playerOneImg: null,
    playerTwoImg: null,
  });

  const [loadingPlayer, setLoadingPlayer] = useState<T_PlayerId | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const handlePlayerSubmit = async (id: T_PlayerId, userName: string) => {
    const trimmedUserName = userName.trim();

    if (!trimmedUserName) {
      return;
    }
    setLoadingPlayer(id);
    try {
      const user = await getGithubUser(trimmedUserName);

      if (!user) {
        return;
      }

      setPlayerData((prevState) => ({
        ...prevState,
        [`${id}Name`]: user.login,
        [`${id}Img`]: user.avatar_url,
      }));
    } finally {
      setLoadingPlayer(null);
    }
  };

  const handleDeletePlayer = (id: T_PlayerId) => {
    setPlayerData((prevState) => ({
      ...prevState,
      [`${id}Name`]: "",
      [`${id}Img`]: null,
    }));
  };

  const setBattleData = (playerOneName: string, playerTwoName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("playerone", playerOneName);
    params.set("playertwo", playerTwoName);
    router.push(`${pathName}/result/?${params.toString()}`);
  };

  const { t } = useI18n();

  return (
    <div className="flex flex-col justify-center">
      <PageHeader
        eyebrow={t("ghBattle.eyebrow")}
        title={t("ghBattle.title")}
        description={t("ghBattle.description")}
      />
      <div className="flex flex-col items-center justify-center gap-5 lg:flex-row">
        <PlayerSlot
          playerId="playerOne"
          label={t("ghBattle.playerOneLabel")}
          name={playerData.playerOneName}
          img={playerData.playerOneImg}
          loadingPlayer={loadingPlayer}
          onDelete={handleDeletePlayer}
          onSubmit={handlePlayerSubmit}
        />
        <div className="flex w-full max-w-72 flex-col items-center justify-center lg:w-auto">
          <div className="mx-0 flex h-12 w-12 items-center justify-center rounded-full border border-border px-4 py-3 font-bold text-foreground lg:mx-5">
            VS
          </div>

          <Button
            disabled={!playerData.playerOneImg || !playerData.playerTwoImg}
            label={t("ghBattle.fightButton")}
            className="mt-5 h-10 w-full cursor-pointer rounded-lg border border-accent bg-accent-soft px-4 py-2 text-sm font-medium text-foreground shadow-[0_18px_40px_var(--shadow-color)] transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
            onClick={() =>
              setBattleData(playerData.playerOneName, playerData.playerTwoName)
            }
          />
        </div>
        <PlayerSlot
          playerId="playerTwo"
          label={t("ghBattle.playerTwoLabel")}
          name={playerData.playerTwoName}
          img={playerData.playerTwoImg}
          loadingPlayer={loadingPlayer}
          onDelete={handleDeletePlayer}
          onSubmit={handlePlayerSubmit}
        />
      </div>
    </div>
  );
};
