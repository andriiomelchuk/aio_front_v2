import { MediaDetails } from "@/components/Movies/MediaDetails";
import { PersonDetails } from "@/components/Movies/PersonDetails";
import { T_MovieSearchType } from "@/components/Movies/types";
import { getMediaDetails, getPersonDetails } from "@/lib/api";

type PageProps = {
  params: Promise<{
    id: string;
    type: T_MovieSearchType;
  }>;
};

export default async function MovieDetailsPage({ params }: PageProps) {
  const movieParams = await params;

  if (movieParams.type === "person") {
    const person = await getPersonDetails(movieParams.id);
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <PersonDetails person={person} />
      </main>
    );
  }

  const details = await getMediaDetails(movieParams.id, movieParams.type as "movie" | "tv");
  
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <MediaDetails details={details} type={movieParams.type} />
    </main>
  );
}