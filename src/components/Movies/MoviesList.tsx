import { useI18n } from "@/shared/i18n";
import { MovieCard } from "./MovieCard";
import type { T_MoviesList } from "./types";

export const MoviesList = ({
  movies,
  hasSearched,
}: T_MoviesList) => {

  const { t } = useI18n();

  if (!hasSearched) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        {t("movies.startSearchText")}
      </p>
    );
  }

  if (movies.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        {t("movies.noResultsText")}
      </p>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} {...movie} />
      ))}
    </div>
  );
};
