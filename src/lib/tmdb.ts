import "server-only";

import { TMDB_BASE_URL } from "@/constants";

async function fetchTmdb(path: string) {
  
  const token = process.env.TMDB_API_TOKEN;

  if (!token) {
    throw new Error("TMDB_API_TOKEN is not defined");
  }

  const fullUrl = `${TMDB_BASE_URL}${path}`;

  const response = await fetch(fullUrl, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TMDB error ${response.status}: ${body}`);
  }

  return response.json();
}

export async function searchTmdb(
  query: string,
  type: string,
  page = "1"
) {
  return fetchTmdb(
    `/search/${type}?query=${encodeURIComponent(
      query
    )}&include_adult=false&language=en-US&page=${page}`
  );
}

export async function getTmdbDetails(id: string, type: string) {
  return fetchTmdb(`/${type}/${id}?language=en-US`);
}
