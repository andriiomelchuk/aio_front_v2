"use client";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { MoviesSearch } from "./MoviesSearch";
import { MoviesList } from "./MoviesList";
import type { T_MoviesList } from "./types";
import { useI18n } from "@/shared/i18n";

export const Movies = ({movies, hasSearched}: T_MoviesList) => {
  const { t } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow={t("movies.eyebrow")}
        title={t("movies.title")}
        description={t("movies.description")}
      />
      <MoviesSearch/>
      <MoviesList movies={movies} hasSearched={hasSearched}/>
    </>
  );
};
