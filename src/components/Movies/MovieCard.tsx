"use client";
import Link from "next/link";
import { T_Movie } from "./types";
import { useSearchParams } from "next/navigation";
import { getTmdbImageUrl } from "@/constants";
import { useI18n } from "@/shared/i18n";

export const MovieCard = ({
  title,
  media_type,
  release_date,
  poster_path,
  name,
  profile_path,
  first_air_date,
  id,
}: T_Movie) => {
  const imagePath = poster_path ?? profile_path;

  const searchParams = useSearchParams();
  const params = searchParams.get("type");

  const imageUrl = getTmdbImageUrl(imagePath, "w342");

  let movieType;

  if (!media_type || media_type === "undefined") {
    movieType = params;
  } else {
    movieType = media_type;
  }

  const { t } = useI18n();

  const movieTitle = title ?? name ?? t("movies.unknownTitle");

  return (
    
    <Link href={`/movies/${movieType}/${id}`}>
      <article className="overflow-hidden rounded-lg border border-border bg-surface transition hover:-translate-y-1 hover:border-accent">
        <div className="aspect-2/3 bg-surface-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={t("movies.posterAlt", { title: movieTitle })}
              className="h-full w-full object-cover"
            />
          ) : (
            <div>{t("movies.noImage")}</div>
          )}
        </div>

        <div className="p-3">
          <div className="truncate text-[1rem] font-medium text-foreground">
            {movieTitle}
          </div>

          <div className="mt-1 flex items-center justify-between text-xs text-muted">
            <span>{release_date ?? first_air_date}</span>
            <span className="capitalize">{movieType}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};
