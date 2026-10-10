import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { forkJoin, map, Observable, switchMap } from "rxjs";
import { GithubRepo, GithubRepoWithLanguages, GithubUser } from "../models/github.model";

const GITHUB_USERNAME = "gabrielepinese";
const EXCLUDED_REPOS = new Set([GITHUB_USERNAME, "portfolio"]);

@Injectable({ providedIn: "root" })
export class GithubService {
  private readonly http = inject(HttpClient);

  getUser(): Observable<GithubUser> {
    return this.http.get<GithubUser>(`https://api.github.com/users/${GITHUB_USERNAME}`);
  }

  getRepos(): Observable<GithubRepoWithLanguages[]> {
    return this.http
      .get<GithubRepo[]>(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`)
      .pipe(
        map((repos) => repos.filter((repo) => !repo.fork && !repo.archived && !EXCLUDED_REPOS.has(repo.name))),
        switchMap((repos) => {
          if (repos.length === 0) return forkJoin([]) as unknown as Observable<GithubRepoWithLanguages[]>;
          return forkJoin(repos.map((repo) => this.withLanguages(repo)));
        }),
      );
  }

  private withLanguages(repo: GithubRepo): Observable<GithubRepoWithLanguages> {
    return this.http.get<Record<string, number>>(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/languages`).pipe(
      map((bytesByLanguage) => {
        const languages = Object.entries(bytesByLanguage).sort(([, a], [, b]) => b - a).map(([lang]) => lang);
        return {
          ...repo,
          languages,
          primaryLanguage: languages[0] ?? repo.language ?? "Other",
        };
      }),
    );
  }
}
