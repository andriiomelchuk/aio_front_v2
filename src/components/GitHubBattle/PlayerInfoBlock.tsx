import { T_PlayerInfoProps } from "./types";

export const PlayerInfoBlock = ({ profile, score }: T_PlayerInfoProps) => {
  return (
    <div className="w-full min-w-40 rounded-md border border-border bg-surface-muted p-3 text-sm text-muted">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs uppercase tracking-wide text-muted">
          Score
        </span>
        <span className="font-semibold text-accent">{score}</span>
      </div>

      <ul className="space-y-1.5">
        <li className="flex justify-between gap-3">
          <span className="text-muted">Login</span>
          <span className="truncate text-foreground">
            {profile.login ? profile.login : "-"}
          </span>
        </li>

        <li className="flex justify-between gap-3">
          <span className="text-muted">Location</span>
          <span className="truncate text-foreground">
            {profile.location ? profile.location : "-"}
          </span>
        </li>

        <li className="flex justify-between gap-3">
          <span className="text-muted">Followers</span>
          <span className="font-medium text-foreground">
            {profile.followers}
          </span>
        </li>

        <li className="flex justify-between gap-3">
          <span className="text-muted">Following</span>
          <span className="font-medium text-foreground">
            {profile.following}
          </span>
        </li>

        <li className="flex justify-between gap-3">
          <span className="text-muted">Repos</span>
          <span className="font-medium text-foreground">
            {profile.public_repos}
          </span>
        </li>

        {profile.blog ? (
          <li className="pt-1">
            <a
              href={profile.blog}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-center text-xs text-accent transition hover:opacity-80"
            >
              {profile.blog}
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  );
};
