export interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
}

export interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  pushed_at: string;
}

export interface GithubRepoWithLanguages extends GithubRepo {
  languages: string[];
  primaryLanguage: string;
}

export interface GithubLanguageGroup {
  language: string;
  repos: GithubRepoWithLanguages[];
}
