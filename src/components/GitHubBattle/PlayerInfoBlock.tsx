import { T_PlayerInfoProps } from "./types";


export const PlayerInfoBlock = ({ profile, score }: T_PlayerInfoProps) => {
  return (
    <div className="w-full min-w-40 rounded-md border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-300">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Score
        </span>
        <span className="font-semibold text-green-400">{score}</span>
      </div>

      <ul className="space-y-1.5">
        
          <li className="flex justify-between gap-3">
            <span className="text-zinc-500">Login</span>
            <span className="truncate text-zinc-200">{profile.login ? profile.login : "-"}</span>
          </li>
       

       
          <li className="flex justify-between gap-3">
            <span className="text-zinc-500">Location</span>
            <span className="truncate text-zinc-200"> {profile.location ? profile.location : "-"}</span>
          </li>
       

        <li className="flex justify-between gap-3">
          <span className="text-zinc-500">Followers</span>
          <span className="font-medium text-zinc-200">{profile.followers}</span>
        </li>

        <li className="flex justify-between gap-3">
          <span className="text-zinc-500">Following</span>
          <span className="font-medium text-zinc-200">{profile.following}</span>
        </li>

        <li className="flex justify-between gap-3">
          <span className="text-zinc-500">Repos</span>
          <span className="font-medium text-zinc-200">
            {profile.public_repos}
          </span>
        </li>

        {profile.blog ? (
          <li className="pt-1">
            <a
              href={profile.blog}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-center text-xs text-green-400 transition hover:text-green-300"
            >
              {profile.blog}
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  );
};
