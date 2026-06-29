import "server-only";

import { searchTmdb, getTmdbDetails } from "./tmdb";
import { T_MediaDetails, T_Movie, T_Person } from "@/components/Movies/types";

export async function getMovies(
  query: string,
  type: string
): Promise<T_Movie[]> {
  const data = await searchTmdb(query, type);
  return data.results;
}

export async function getMediaDetails(
  id: string,
  type: "movie" | "tv"
): Promise<T_MediaDetails> {
  return getTmdbDetails(id, type);
}

export async function getPersonDetails(
  id: string
): Promise<T_Person> {
  return getTmdbDetails(id, "person");
}




