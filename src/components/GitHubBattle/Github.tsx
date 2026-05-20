// import { getProfile } from "@/lib/api";
import { useState } from "react";
import { PlayerInput } from "./PlayerInput";
import { PlayerData } from "./types";
import { PlayerCard } from "./PlayerCard";
import { CardShell } from "./CardShell";
import { PlayerLoading } from "./PlayerLoading";

export const GitHub = () => {
  const [playerData, setPlayerData] = useState<PlayerData>({
    playerOneName: "",
    playerTwoName: "",
    playerOneImg: null,
    playerTwoImg: null,
  });

  const [loadingPlayer, setLoadingPlayer] = useState<string | null>(null);

  const handlePlayerSubmit = async (id: string, userName: string) => {
    const trimmedUserName = userName.trim();

    if (!trimmedUserName) {
      return;
    }

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(trimmedUserName)}`,
      );

      if (!response.ok) {
        return;
      }

      const user = await response.json();

      setPlayerData((prevState) => ({
        ...prevState,
        [`${id}Name`]: user.login,
        [`${id}Img`]: user.avatar_url,
      }));
    } finally {
      setLoadingPlayer(null);
    }
  };

  const handleDeletePlayer = (id: string) => {
    setPlayerData((prevState) => ({
      ...prevState,
      [`${id}Name`]: "",
      [`${id}Img`]: null,
    }));
  };

  return (
    <div className="flex justify-center flex-col">
      <div>Battle</div>
      <div className="players flex  justify-center items-center">
        <CardShell
          variant={
            loadingPlayer === "playerOne"
              ? "loading"
              : playerData.playerOneImg
                ? "ready"
                : "empty"
          }
        >
          {loadingPlayer === "playerOne" ? (
            <PlayerLoading label="Player #1" />
          ) : playerData.playerOneImg ? (
            <PlayerCard
              name={playerData.playerOneName}
              img={playerData.playerOneImg}
              onDelete={handleDeletePlayer}
              playerId="playerOne"
            />
          ) : (
            <PlayerInput
              playerId="playerOne"
              label="Player #1"
              onSubmit={handlePlayerSubmit}
            />
          )}
        </CardShell>
        <div className="flex flex-col justify-center items-center">
          <div className="flex items-center rounded-full border px-4 py-3 font-bold h-12 w-12 mr-5 ml-5 justify-center">
            VS
          </div>

          <button
            disabled={!playerData.playerOneImg || !playerData.playerTwoImg}
            className="disabled:opacity-50 disabled:cursor-not-allowed mt-5 cursor-pointer rounded-lg border bg-zinc-550 p-2 shadow-lg mr-5 ml-5 
                       border-3 border-green-500/40 shadow-green-950/30"
          >
            FIGHT
          </button>
        </div>
        <CardShell
          variant={
            loadingPlayer === "playerTwo"
              ? "loading"
              : playerData.playerTwoImg
                ? "ready"
                : "empty"
          }
        >
          {loadingPlayer === "playerTwo" ? (
            <PlayerLoading label="Player #2" />
          ) : playerData.playerTwoImg ? (
            <PlayerCard
              name={playerData.playerTwoName}
              img={playerData.playerTwoImg}
              onDelete={handleDeletePlayer}
              playerId="playerTwo"
            />
          ) : (
            <PlayerInput
              playerId="playerTwo"
              label="Player #1"
              onSubmit={handlePlayerSubmit}
            />
          )}
        </CardShell>
      </div>
    </div>
  );
};
