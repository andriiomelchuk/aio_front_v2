import { ReactNode } from "react";

export type T_PlayerData = {
    playerOneName: string;
    playerTwoName: string;
    playerOneImg: string | null;
    playerTwoImg: string | null;
}

export type T_PlayerProps = {
  playerId: T_PlayerId;
  label: string;
  onSubmit: (id: T_PlayerId, userName: string) => void;
};

export type T_CardShellProps = {
  children: ReactNode;
  variant?: "empty" | "loading" | "ready";
};

export type T_PlayerCardProps = {
  name: string;
  img: string;
  children?: ReactNode,
  label?: string
};

export type T_PlayerLoadingProps = {
  label: string;
};

export type T_PlayerSlotProps = {
    playerId: T_PlayerId,
    label: string,
    name: string,
    img: string | null,
    loadingPlayer: string | null,
    onDelete: (id: T_PlayerId) => void,
    onSubmit: (id: T_PlayerId, userName: string) => void,
}

export type T_PlayerId = "playerOne" | "playerTwo";

export type T_PlayerResult = {
    label: string;
    score: number;
    profile: T_Profile
};

export type T_Profile = {
    login: string | null;
    avatar_url: string | null;
    name: string | null;
    location: string | null;
    company: string | null;
    followers: number;
    following: number;
    public_repos: number;
    blog: string | null;
};

export type T_BattleResult = {
    score: number;
    profile: T_Profile;
};

export type T_PlayerInfoProps = {
  profile: T_Profile,
  score: number
}