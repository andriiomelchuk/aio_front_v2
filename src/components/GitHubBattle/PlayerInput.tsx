"use client";
import { useState } from "react";
import { T_PlayerProps } from "./types";
import { Avatar } from "@/shared/ui/Avatar";

export const PlayerInput = ({ playerId, label, onSubmit }: T_PlayerProps) => {
  const [userName, setUserName] = useState("");

  return (
    <>
      <form
        className="flex h-full flex-col justify-between items-center"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(playerId, userName);
        }}
      >
        <label className="text-sm font-medium text-zinc-300 flex justify-center h-5 my-5">
          {label}
        </label>
        <Avatar alt="searching player" size="mid" />
        <div className="h-20 flex items-center">
          <input
            className="mt-3 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white 
                       outline-none transition placeholder:text-zinc-500 focus:border-green-500"
            type="text"
            placeholder="Enter GitHub username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="h-20  flex justify-center items-end">
          <button
            className="h-10 min-w-50 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 
                     transition hover:border-green-500 hover:bg-green-500/10 hover:text-green-300 disabled:bg-zinc-800 
                     disabled:text-zinc-500 disabled:border-zinc-700"
            type="submit"
            disabled={!userName.trim()}
          >
            Search
          </button>
        </div>
      </form>
    </>
  );
};
