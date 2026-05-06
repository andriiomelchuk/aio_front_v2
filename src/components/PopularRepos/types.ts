export type Repo = {
  name: string;
  stargazers_count: number;
  language: string,
  id: number,
  owner: {
    avatar_url: string;
    id: number;
    url: string;
    repos_url: string;
    login: string;
  };
};

export type Languages = {
    id: string,
    name: string
}

