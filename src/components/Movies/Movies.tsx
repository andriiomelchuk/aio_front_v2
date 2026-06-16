import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { MoviesSearch } from "./MoviesSearch";
import { MoviesList } from "./MoviesList";
import { T_MoviesList } from "./types";

export const Movies = ({movies, hasSearched}: T_MoviesList) => {
  return (
    <>
      <PageHeader
        eyebrow="Movies search page"
        title="Movie Explorer"
        description="Search movies, browse details, and build your watchlist."
      />
      <MoviesSearch/>
      <MoviesList movies={movies} hasSearched={hasSearched}/>
    </>
  );
};
