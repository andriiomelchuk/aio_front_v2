export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
export const TMDB_IMAGE_WIDTH = "w500";

export const getTmdbImageUrl = (
  path?: string | null,
  width = TMDB_IMAGE_WIDTH
) => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${width}${path}`;
};


