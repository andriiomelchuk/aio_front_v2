export type T_Movie = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv" | "person" | "undefined";
  poster_path?: string | null;
  profile_path?: string | null;
  overview?: string;
  
}

export type T_MoviesList = {
  movies: T_Movie[];
  hasSearched: boolean
};

export type T_MovieSearchType = "multi" | "movie" | "tv" | "person";




export type T_Person = {
  name: string;
  biography?: string;
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string;
  known_for_department?: string;
  profile_path?: string | null;
  also_known_as?: string[];
  homepage?: string | null;
}

export type T_PersonDetails = {
  person: T_Person;
}


export type T_MediaDetails = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  tagline?: string;
  poster_path?: string | null;

  release_date?: string;
  first_air_date?: string;

  runtime?: number;
  episode_run_time?: number[];

  number_of_seasons?: number;
  number_of_episodes?: number;
  last_air_date?: string;

  vote_average?: number;
  status?: string;
  homepage?: string;


  genres?: {
    id: number;
    name: string;
  }[];
}

export type T_MediaDetailsProps = {
  details: T_MediaDetails;
  type: T_MovieSearchType;
}