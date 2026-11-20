import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { GithubRepo, GithubRepoWithLanguages, GithubUser } from "../models/github.model";

const GITHUB_USERNAME = "gabrielepinese";
const EXCLUDED_REPOS = new Set([GITHUB_USERNAME, "portfolio"]);
const API = "https://api.github.com";

/**
 * Responses are cached in the visitor's localStorage for an hour. Unauthenticated GitHub
 * API calls are capped at 60/hour per IP and one Works visit costs 2 + one per repo, so
 * reloads and back-and-forth navigation would hit the cap quickly. Only public data about
 * the GitHub profile is stored, nothing about the visitor, and it never leaves the browser.
 * After an hour the next visit fetches fresh data; if that fetch fails (rate limit,
 * offline), the last saved copy is shown instead of the "Unavailable" state.
 *
 * Plain `fetch` (no HttpClient / RxJS): two GET requests don't need the interceptor
 * machinery, and it keeps HttpClient out of the app's bundles entirely.
 */
const CACHE_TTL = 60 * 60 * 1000;
const CACHE_PREFIX = "github-cache:v1:";

interface CacheEntry<T> {
  at: number;
  data: T;
}

@Injectable({ providedIn: "root" })
export class GithubService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getUser(signal?: AbortSignal): Promise<GithubUser> {
    return this.cached("user", () => getJson<GithubUser>(`${API}/users/${GITHUB_USERNAME}`, signal));
  }

  getRepos(signal?: AbortSignal): Promise<GithubRepoWithLanguages[]> {
    return this.cached("repos", async () => {
      const repos = await getJson<GithubRepo[]>(
        `${API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
        signal,
      );
      const visible = repos.filter((r) => !r.fork && !r.archived && !EXCLUDED_REPOS.has(r.name));
      return Promise.all(visible.map((repo) => this.withLanguages(repo, signal)));
    });
  }

  private async withLanguages(repo: GithubRepo, signal?: AbortSignal): Promise<GithubRepoWithLanguages> {
    const bytesByLanguage = await getJson<Record<string, number>>(
      `${API}/repos/${GITHUB_USERNAME}/${repo.name}/languages`,
      signal,
    );
    const languages = Object.entries(bytesByLanguage)
      .sort(([, a], [, b]) => b - a)
      .map(([lang]) => lang);
    return { ...repo, languages, primaryLanguage: languages[0] ?? repo.language ?? "Other" };
  }

  /** Fresh cache → no request. Otherwise fetch and save; on failure fall back to any saved copy. */
  private async cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const saved = this.read<T>(key);
    if (saved && Date.now() - saved.at < CACHE_TTL) return saved.data;
    try {
      const data = await load();
      this.write(key, data);
      return data;
    } catch (err) {
      if (saved) return saved.data;
      throw err;
    }
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

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" }, signal });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json() as Promise<T>;
}
