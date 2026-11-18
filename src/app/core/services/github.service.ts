import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { catchError, defer, forkJoin, map, Observable, of, switchMap, tap, throwError } from "rxjs";
import { GithubRepo, GithubRepoWithLanguages, GithubUser } from "../models/github.model";

const GITHUB_USERNAME = "gabrielepinese";
const EXCLUDED_REPOS = new Set([GITHUB_USERNAME, "portfolio"]);

/**
 * Responses are cached in the visitor's localStorage for an hour. Unauthenticated GitHub
 * API calls are capped at 60/hour per IP and one Works visit costs 2 + one per repo, so
 * reloads and back-and-forth navigation would hit the cap quickly. Only public data about
 * the GitHub profile is stored, nothing about the visitor, and it never leaves the browser.
 * After an hour the next visit fetches fresh data; if that fetch fails (rate limit,
 * offline), the last saved copy is shown instead of the "Unavailable" state.
 */
const CACHE_TTL = 60 * 60 * 1000;
const CACHE_PREFIX = "github-cache:v1:";

interface CacheEntry<T> {
  at: number;
  data: T;
}

@Injectable({ providedIn: "root" })
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getUser(): Observable<GithubUser> {
    return this.cached("user", () =>
      this.http.get<GithubUser>(`https://api.github.com/users/${GITHUB_USERNAME}`),
    );
  }

  getRepos(): Observable<GithubRepoWithLanguages[]> {
    return this.cached("repos", () =>
      this.http
        .get<GithubRepo[]>(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`)
        .pipe(
          map((repos) => repos.filter((repo) => !repo.fork && !repo.archived && !EXCLUDED_REPOS.has(repo.name))),
          switchMap((repos) => {
            if (repos.length === 0) return of<GithubRepoWithLanguages[]>([]);
            return forkJoin(repos.map((repo) => this.withLanguages(repo)));
          }),
        ),
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

  /** Fresh cache → no request. Otherwise fetch and save; on failure fall back to any saved copy. */
  private cached<T>(key: string, fetch: () => Observable<T>): Observable<T> {
    return defer(() => {
      const saved = this.read<T>(key);
      if (saved && Date.now() - saved.at < CACHE_TTL) return of(saved.data);

      return fetch().pipe(
        tap((data) => this.write(key, data)),
        catchError((err) => (saved ? of(saved.data) : throwError(() => err))),
      );
    });
  }

  private read<T>(key: string): CacheEntry<T> | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      return typeof entry?.at === "number" && entry.data !== undefined ? entry : null;
    } catch {
      return null; // storage blocked or corrupt entry: behave as if nothing was saved
    }
  }

  private write<T>(key: string, data: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), data } satisfies CacheEntry<T>));
    } catch {
      // storage unavailable or full: the page still works, it just refetches next time
    }
  }
}
