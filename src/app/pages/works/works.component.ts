import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ItemListComponent } from "../../shared/ui/item-list/item-list.component";
import { LIST_ITEMS, CompanyList } from "../../core/models/company-list";
import { MotionService } from "../../shared/services/motion.service";
import { RevealDirective } from "../../shared/directives/reveal.directive";
import { GithubProjectsComponent } from "./github-projects/github-projects.component";
import { injectTitleTypewriter } from "../../shared/utils/typewriter";
import { scrollBelowNavbar } from "../../shared/utils/scroll";

/** Typed title; a page-coloured "." is typed after it (like "About me." / "Contact me."). */
const TITLE = "Work";
const SUBTITLE =
  "A peek into my journey as a Software Engineer: real experiences, projects in the works, and plenty of code on the way.";

/** One line of the hero `git log --graph`. `graph` is drawn char by char ("*" = commit). */
interface LogLine {
  graph: string;
  hash?: string;
  /** Decorations, coloured like git: HEAD cyan, branches green, tags yellow. */
  refs?: { label: string; kind: "head" | "branch" | "tag" }[];
  msg?: string;
}

@Component({
  selector: "app-works",
  imports: [ItemListComponent, GithubProjectsComponent, RevealDirective],
  templateUrl: "./works.component.html",
  styleUrl: "./works.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorksComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(MotionService);

  readonly companyList: CompanyList[] = LIST_ITEMS;
  /** Phones: the one experience expanded (accordion, one at a time). Starts on the latest. */
  readonly openIndex = signal(0);

  // ── typewriter title (same feel as the Home / Contact headlines) ──
  private readonly hero = injectTitleTypewriter(TITLE, 110);
  readonly title = this.hero.title;
  readonly typing = this.hero.typing;
  readonly caret = this.hero.caret;
  /** Title written: the rest of the hero (subtitle, log, cue) starts. */
  readonly done = this.hero.done;

  readonly subtitle = SUBTITLE;
  readonly subtitleWords = SUBTITLE.split(" ");

  /**
   * Hero terminal: the career as a `git log --graph`, newest on top, printed once line
   * by line (each line fades in at `--t`, see SCSS). Decorative: the sections below
   * say the same in plain words.
   */
  readonly log: LogLine[] = [
    {
      graph: "*",
      hash: "a3f9c21",
      refs: [{ label: "HEAD -> main", kind: "head" }],
      msg: "feat: own features end-to-end",
    },
    {
      graph: "| *",
      hash: "5c1d7e0",
      refs: [{ label: "side-projects", kind: "branch" }],
      msg: "wip: building in public",
    },
    { graph: "|/" },
    { graph: "*", hash: "7b2e004", msg: "refactor: frontend → software engineer" },
    {
      graph: "*",
      hash: "51d8e3a",
      refs: [{ label: "tag: v1.0", kind: "tag" }],
      msg: "feat: join Lunalabs · Oct 2022",
    },
    {
      graph: "*",
      hash: "e09c7f2",
      refs: [{ label: "tag: v0.1", kind: "tag" }],
      msg: "feat: Java + Spring @ Do Different",
    },
    { graph: "*", hash: "1f00d0e", msg: "init: hello, world" },
  ];
  /** Seconds (after the title) at which the first log line prints, and the gap between lines. */
  readonly logStart = 0.7;
  readonly logStep = 0.28;

  constructor() {
    // deep link (e.g. Home → /works#projects): land on the section once it's rendered
    afterNextRender(() => {
      const fragment = this.route.snapshot.fragment;
      if (!fragment) return;
      setTimeout(() => {
        const target = this.document.getElementById(fragment);
        if (target) scrollBelowNavbar(target, { instant: this.motion.paused() });
      }, 100);
    });
  }

  /** "Read the full log" cue: smooth scroll to the experiences, below the fixed navbar. */
  jumpTo(target: HTMLElement): void {
    scrollBelowNavbar(target, { instant: this.motion.paused() });
  }
}
