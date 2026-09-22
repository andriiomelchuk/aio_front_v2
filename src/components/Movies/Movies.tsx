"use client";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { MoviesSearch } from "./MoviesSearch";
import { MoviesList } from "./MoviesList";
import type { T_MoviesList } from "./types";
import { useI18n } from "@/shared/i18n";

export const Movies = ({movies, hasSearched}: T_MoviesList) => {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow={t("movies.eyebrow")}
        title={t("movies.title")}
        description={t("movies.description")}
      />
      <MoviesSearch/>
      <MoviesList movies={movies} hasSearched={hasSearched}/>
    </section>
  );
};
