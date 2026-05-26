export type T_Repo = {
  name: string;
  stargazers_count: number;
  language: string | null,
  id: number,
  description: string | null,
  html_url: string,
  owner: {
    avatar_url: string;
    id: number;
    url: string;
    repos_url: string;
    login: string;
  };
};

export type T_Languages = {
    id: string,
    name: string
}


export type T_PopularResponse = {
  total_count: number;
  items: T_Repo[];
};

export type T_LanguageCheckResponse = {
  total_count: number;
};
