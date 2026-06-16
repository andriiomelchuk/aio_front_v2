import { T_MediaDetails, T_MediaDetailsProps } from "./types";

export const MediaDetails = ({ details, type }: T_MediaDetailsProps) => {
  const title = details.title ?? details.name ?? "Unknown title";
  const date = details.release_date ?? details.first_air_date;
  const link = "https://image.tmdb.org/t/p/w500";

  return (
    <section className="grid gap-8 rounded-xl border border-border bg-surface p-6 shadow-[0_18px_40px_var(--shadow-color)] md:grid-cols-[280px_1fr]">
      <div className="overflow-hidden rounded-lg bg-surface-muted">
        {details.poster_path ? (
          <img
            src={`${link}${details.poster_path}`}
            alt={`${title} poster`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex aspect-2/3 items-center justify-center text-muted">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-sm uppercase tracking-wide text-accent">
          {type}
        </span>

        <h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1>

        {details.tagline && (
          <p className="mt-2 text-sm italic text-muted">{details.tagline}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {details.genres?.map((genre: { id: number; name: string }) => (
            <span
              key={genre.id}
              className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs text-muted"
            >
              {genre.name}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted">Release date</p>
            <p className="text-foreground">{date || "Unknown"}</p>
          </div>

          <div>
            <p className="text-muted">Rating</p>
            <p className="text-foreground">
              {details.vote_average
                ? `${details.vote_average.toFixed(1)} / 10`
                : "No rating"}
            </p>
          </div>

          {details.runtime && (
            <div>
              <p className="text-muted">Runtime</p>
              <p className="text-foreground">{details.runtime} min</p>
            </div>
          )}

          {details.last_air_date && (
            <div>
              <p className="text-muted">Last air date</p>
              <p className="text-foreground">{details.last_air_date}</p>
            </div>
          )}

          {details.status && (
            <div>
              <p className="text-muted">Status</p>
              <p className="text-foreground">{details.status}</p>
            </div>
          )}

          {details.number_of_seasons && (
            <div>
              <p className="text-muted">Seasons</p>
              <p className="text-foreground">{details.number_of_seasons}</p>
            </div>
          )}
          {details.number_of_episodes && (
            <div>
              <p className="text-muted">Episodes</p>
              <p className="text-foreground">{details.number_of_episodes}</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>

          <p className="mt-2 leading-7 text-muted">
            {details.overview || "No description available."}
          </p>
        </div>

        {details.homepage && (
          <a
            href={details.homepage}
            target="_blank"
            rel="noreferrer"
            className="mt-8 w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-background transition hover:opacity-85"
          >
            Official website
          </a>
        )}
      </div>
    </section>
  );
};
