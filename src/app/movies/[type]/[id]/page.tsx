import { MediaDetails } from "@/components/Movies/MediaDetails";
import { PersonDetails } from "@/components/Movies/PersonDetails";
import { T_MovieSearchType } from "@/components/Movies/types";
import { getMovieDetails } from "@/lib/api";

type PageProps = {
    params: Promise<{
        id: string,
        type: T_MovieSearchType
    }>;
}

export default async function MovieDetailsPage({ params }: PageProps) {
  const movieParams = await params;

  const details = await getMovieDetails(movieParams.id, movieParams.type);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
        {movieParams.type === "person" ? (
            <PersonDetails person={details}  />
        ) : (
            <MediaDetails details={details} type={movieParams.type}/>
        )}
    </main>
  );
}
