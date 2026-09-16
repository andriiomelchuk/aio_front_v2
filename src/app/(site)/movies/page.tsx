import { Movies } from "@/components/Movies";
import { getMovies } from "@/lib/api";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Explorer",
  description: "Search for movies, series, and people.",
  alternates: { canonical: "/movies" },
};

type T_SearchParams = {
  searchParams: Promise<{
    query?: string;
    type?: string;
  }>;
};

export default async function MoviesPage({ searchParams }: T_SearchParams) {
  const params = await searchParams;


  if (!params.query || !params.type) {
    return (
      <Suspense fallback={null}>
        <Movies movies={[]} hasSearched={false} />
      </Suspense>
    );
  }

  const movies = await getMovies(params.query, params.type);

  return (
    <Suspense fallback={null}>
      <Movies movies={movies} hasSearched={true} />
    </Suspense>
  );
}
