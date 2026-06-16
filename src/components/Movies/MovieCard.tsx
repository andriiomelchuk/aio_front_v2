"use client";
import Link from "next/link";
import { T_Movie } from "./types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  let movieType;

  if(!media_type || media_type === "undefined") {
    movieType = params;
  }else{
    movieType = media_type;
  }

  return (
    <Link href={`/movies/${movieType}/${id}`}>
      <article
        className="overflow-hidden rounded-lg border border-border bg-surface transition hover:-translate-y-1 hover:border-accent"
      >
        <div className="aspect-2/3 bg-surface-muted">
          {imagePath ? (
            <img
              src={`https://image.tmdb.org/t/p/w342${imagePath}`}
              alt={`${title ?? name ?? "Unknown"} poster`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted">
              No poster
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="truncate text-[1rem] font-medium text-foreground">
            {title ?? name}
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
