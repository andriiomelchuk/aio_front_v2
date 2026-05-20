import { ReactNode } from "react";

export type PlayerData = {
    playerOneName: string;
    playerTwoName: string;
    playerOneImg: string | null;
    playerTwoImg: string | null;
}

export type PlayerProps = {
  playerId: string;
  label: string;
  onSubmit: (id: string, userName: string) => void;
};

export type CardShellProps = {
  children: ReactNode;
  variant?: "empty" | "loading" | "ready";
};

export type PlayerCardProps = {
  name: string;
  img: string;
  onDelete: (id: string) => void;
  playerId: string;
};

export type PlayerLoadingProps = {
  label: string;
};