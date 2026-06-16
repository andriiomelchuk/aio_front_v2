import { T_BattleResult, T_Profile } from "@/components/GitHubBattle/types";
import { T_Movie } from "@/components/Movies/types";
import { T_LanguageCheckResponse, T_PopularResponse, T_Repo } from "@/components/PopularRepos/types";



export async function getPopular(language: string): Promise<T_PopularResponse> {

  const languageQuery = language === "all" ? "" : `+language:${encodeURIComponent(language)}`;

  const response = await fetch(`https://api.github.com/search/repositories?q=stars:>1${languageQuery}&sort=stars&order=desc&type=Repositories&per_page=30`,
    {
      cache: "no-store"
    })

  if (!response.ok) {
    throw new Error('Failed to fetch')
  }

  return response.json()
}

export const checkLanguageExists = async (lang: string): Promise<boolean> => {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=language:${encodeURIComponent(lang)}&per_page=1`
  );

  if (!response.ok) {
    return false;
  }

  const data: T_LanguageCheckResponse = await response.json();

  return data.total_count > 0;
};


/*Github battle*/

export const getGithubUser = async (userName: string): Promise<T_Profile | null> => {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(userName)}`,
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export const getProfile = async (userName: string): Promise<T_Profile | null> => {

  const response = await fetch(`https://api.github.com/users/${userName}`)

  if (!response.ok) {
    return null;
  }
  return response.json()

}


const getRepos = async (userName: string): Promise<T_Repo[]> => {
  const response = await fetch(`https://api.github.com/users/${userName}/repos?per_page=100`)
  if (!response.ok) {
    return [];
  }

  return response.json();
}



const getUserData = async (userName: string): Promise<T_BattleResult> => {
  const [profile, repos] = await Promise.all([
    getProfile(userName),
    getRepos(userName)
  ]);

  if (!profile) {
    throw new Error("User not found")
  }

  return {
    profile,
    score: calculateScore(profile, repos)
  }
}

const calculateScore = (profile: T_Profile, repos: T_Repo[]): number => {
  const followers = profile.followers;
  const totalStars = getStarCount(repos);
  return followers + totalStars;
}

const getStarCount = (repos: T_Repo[]): number => {
  return repos.reduce((acc, repo) => acc + repo.stargazers_count, 0)
}

const sortPlayers = (players: T_BattleResult[]): T_BattleResult[] => {
  return players.sort((a, b) => b.score - a.score)
};

export const makeBattle = (players: string[]): Promise<T_BattleResult[]> => {
  return Promise.all(players.map(getUserData)).then(sortPlayers)
}



export const getMovies = async (query: string, type: string): Promise<T_Movie[]> => {

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`
    }
  };

  const response = await fetch(`https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options)
  if (!response.ok) {
    throw new Error(`TMDB error: ${response.status}`);
  }
  const data = await response.json();

  console.log(data)

  return data.results;

}

export const getMovieDetails = async (movieId: string, movieType: string ) => {

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`
    }
  };

  const response = await fetch(`https://api.themoviedb.org/3/${movieType}/${movieId}?language=en-US`, options)
  console.log(response)
   if (!response.ok) {
    throw new Error(`TMDB error: ${response.status}`);
  }
  
  const data = await response.json();

  console.log(data)

  return data;
}