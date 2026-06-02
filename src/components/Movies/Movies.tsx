import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { MoviesSearch } from "./MoviesSearch";
import { MoviesList } from "./MoviesList";

export const Movies = () => {
  return (
    <>
      <PageHeader
        eyebrow="Movies search page"
        title="Movie Explorer"
        description="Search movies, browse details, and build your watchlist."
      />
      <MoviesSearch/>
      <MoviesList />
    </>
  );
};
