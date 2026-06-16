import { MovieCard } from "./MovieCard";
import { T_MoviesList } from "./types";

export const MoviesList = ({
  movies,
  hasSearched,
}: T_MoviesList) => {
  if (!hasSearched) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        Enter a title to start searching.
      </p>
    );
  }

  if (movies.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        Nothing found. Try another title or category.
      </p>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} {...movie} />
      ))}
    </div>
  );
};
