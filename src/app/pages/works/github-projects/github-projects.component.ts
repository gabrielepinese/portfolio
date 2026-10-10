import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { GithubService } from "../../../core/services/github.service";
import { GithubLanguageGroup, GithubUser } from "../../../core/models/github.model";

const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  Java: "#b07219",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
};

const RECENT_ACTIVITY_DAYS = 21;

@Component({
  selector: "app-github-projects",
  imports: [],
  templateUrl: "./github-projects.component.html",
  styleUrl: "./github-projects.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GithubProjectsComponent {
  private readonly github = inject(GithubService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly user = signal<GithubUser | null>(null);
  readonly groups = signal<GithubLanguageGroup[]>([]);

  constructor() {
    afterNextRender(() => {
      forkJoin([this.github.getUser(), this.github.getRepos()]).subscribe({
        next: ([user, repos]) => {
          this.user.set(user);

          const byLanguage = new Map<string, GithubLanguageGroup>();
          for (const repo of repos) {
            const language = repo.primaryLanguage;
            const group = byLanguage.get(language) ?? { language, repos: [] };
            group.repos.push(repo);
            byLanguage.set(language, group);
          }

          const groups = [...byLanguage.values()]
            .map((group) => ({
              ...group,
              repos: [...group.repos].sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at)),
            }))
            .sort((a, b) => b.repos.length - a.repos.length || a.language.localeCompare(b.language));

          this.groups.set(groups);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  languageColor(language: string): string {
    return LANGUAGE_COLORS[language] ?? "#8b1624";
  }

  isRecentlyActive(pushedAt: string): boolean {
    const daysSincePush = (Date.now() - Date.parse(pushedAt)) / (1000 * 60 * 60 * 24);
    return daysSincePush <= RECENT_ACTIVITY_DAYS;
  }

  relativeTime(dateStr: string): string {
    const days = Math.floor((Date.now() - Date.parse(dateStr)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }

  goto(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
