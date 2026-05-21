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
        <label className="my-5 flex h-5 justify-center text-sm font-medium text-muted">
          {label}
        </label>
        <Avatar alt="searching player" size="mid" />
        <div className="h-20 flex items-center">
          <input
            className="mt-3 w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground 
                       outline-none transition placeholder:text-muted focus:border-accent"
            type="text"
            placeholder="Enter GitHub username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="h-20  flex justify-center items-end">
          <button
            className="h-10 min-w-50 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted 
                     transition hover:border-accent hover:bg-accent-soft hover:text-accent disabled:border-border 
                     disabled:bg-surface-muted disabled:text-muted"
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
