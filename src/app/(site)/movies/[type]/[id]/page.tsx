import { MediaDetails } from "@/components/Movies/MediaDetails";
import { PersonDetails } from "@/components/Movies/PersonDetails";
import type { T_MovieSearchType } from "@/components/Movies/types";
import { getMediaDetails, getPersonDetails } from "@/lib/api";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{
    id: string;
    type: T_MovieSearchType;
  }>;
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id, type } = await params;

  return {
    alternates: { canonical: `/movies/${type.toLowerCase()}/${id}` },
  };
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
