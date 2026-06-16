import { Movies } from "@/components/Movies";
import { getMovies } from "@/lib/api";

type T_SearchParams = {
  searchParams: Promise<{
    query?: string;
    type?: string;
  }>;
};

export default async function MoviesPage({ searchParams }: T_SearchParams) {
  const params = await searchParams;


  if (!params.query || !params.type) {
    return <Movies movies={[]} hasSearched={false}/>;
  }

  const movies = await getMovies(params.query, params.type);

  return <Movies movies={movies} hasSearched={true}/>;
}
