import { useState } from "react";
import { T_PlayerData, T_PlayerId } from "./types";
import { PlayerSlot } from "./PlayerSlot";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { Button } from "@/shared/ui/Button";
import { getGithubUser } from "@/lib/github";

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

  return (
    <div className="flex justify-center flex-col">
      <PageHeader
        eyebrow="GitHub Battle"
        title="Choose Your Players"
        description="Enter two GitHub usernames and compare their profiles."
      />
      <div className="players flex  justify-center items-center">
        <PlayerSlot
          playerId="playerOne"
          label="Player #1"
          name={playerData.playerOneName}
          img={playerData.playerOneImg}
          loadingPlayer={loadingPlayer}
          onDelete={handleDeletePlayer}
          onSubmit={handlePlayerSubmit}
        />
        <div className="flex flex-col justify-center items-center">
          <div className="mr-5 ml-5 flex h-12 w-12 items-center justify-center rounded-full border border-border px-4 py-3 font-bold text-foreground">
            VS
          </div>

          <Button
            disabled={!playerData.playerOneImg || !playerData.playerTwoImg}
            label="FIGHT"
            className="mt-5 mr-5 ml-5 cursor-pointer rounded-lg border border-accent bg-accent-soft p-2 text-sm font-medium text-foreground shadow-[0_18px_40px_var(--shadow-color)] transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() =>
              setBattleData(playerData.playerOneName, playerData.playerTwoName)
            }
          />
        </div>
        <PlayerSlot
          playerId="playerTwo"
          label="Player #2"
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
