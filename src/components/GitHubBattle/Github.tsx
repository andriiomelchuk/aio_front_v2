import { useState } from "react";
import { T_PlayerData, T_PlayerId } from "./types";
import { getGithubUser } from "@/lib/api";
import { PlayerSlot } from "./PlayerSlot";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

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
      <div>Battle</div>
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
          <div className="flex items-center rounded-full border px-4 py-3 font-bold h-12 w-12 mr-5 ml-5 justify-center">
            VS
          </div>

          <button
            disabled={!playerData.playerOneImg || !playerData.playerTwoImg}
            className="disabled:opacity-50 disabled:cursor-not-allowed mt-5 cursor-pointer rounded-lg border bg-zinc-550 p-2 
            shadow-lg mr-5 ml-5 border-3 border-green-500/40 shadow-green-950/30"
            onClick={() =>
              setBattleData(playerData.playerOneName, playerData.playerTwoName)
            }
          >
            FIGHT
          </button>
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
