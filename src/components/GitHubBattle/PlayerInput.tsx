"use client";
import { useState } from "react";
import type { T_PlayerProps } from "./types";
import { Avatar } from "@/shared/ui/Avatar";
import { Input } from "@/shared/ui/Input/Input";
import { Button } from "@/shared/ui/Button";
import { useI18n } from "@/shared/i18n";

export const PlayerInput = ({ playerId, label, onSubmit }: T_PlayerProps) => {
  const [userName, setUserName] = useState("");
  const { t } = useI18n();

  return (
    <>
      <form
        className="flex h-full w-full flex-col items-center justify-between"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(playerId, userName);
        }}
      >
        <label className="my-5 flex h-5 justify-center text-sm font-medium text-muted">
          {label}
        </label>
        <Avatar alt={t("ghBattle.searchingPlayerAlt")} size="mid" />
        <div className="flex h-20 w-full items-center">
          <Input
            className="mt-3 h-10 w-full"
            value={userName}
            placeholder={t("ghBattle.inputPlaceholder")}
            onChange={(e) => setUserName(e.target.value)}
            type={"text"}
          />
        </div>

        <div className="flex h-20 w-full items-end justify-center">
          <Button
            variant="ghost"
            className="h-10 w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-muted
                     transition hover:border-accent hover:bg-accent-soft hover:text-accent disabled:border-border 
                     disabled:bg-surface-muted disabled:text-muted"
            type="submit"
            disabled={!userName.trim()}
          >
            {t("ghBattle.searchButton")}
          </Button>
        </div>
      </form>
    </>
  );
};
