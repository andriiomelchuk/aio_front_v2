"use client";
import { useState } from "react";
import { PlayerProps } from "./types";

export const PlayerInput = ({ playerId, label, onSubmit }: PlayerProps) => {
  const [userName, setUserName] = useState("");

  return (
    <>
      <form
        className="flex h-full flex-col justify-between"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(playerId, userName);
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="h-24 w-24 mb-5 flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-2xl font-semibold text-zinc-500">
            ?
          </div>

          <label className="text-sm font-medium text-zinc-300">{label}</label>

          <input
            className="mt-3 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white 
                       outline-none transition placeholder:text-zinc-500 focus:border-green-500"
            type="text"
            placeholder="Enter GitHub username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <button
          className="mt-6 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 
                     transition hover:border-green-500 hover:bg-green-500/10 hover:text-green-300 disabled:bg-zinc-800 
                     disabled:text-zinc-500 disabled:border-zinc-700"
          type="submit"
          disabled={!userName.trim()}
        >
          Search
        </button>
      </form>
    </>
  );
};
