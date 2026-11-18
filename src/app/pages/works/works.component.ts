import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  signal,
  untracked,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ItemListComponent } from "../../shared/ui/item-list/item-list.component";
import { LIST_ITEMS, CompanyList } from "../../core/models/company-list";
import { MotionService } from "../../shared/services/motion.service";
import { RevealDirective } from "../../shared/directives/reveal.directive";
import { GithubProjectsComponent } from "./github-projects/github-projects.component";

/** Typed title; a page-coloured "." is typed after it (like "About me." / "Contact me."). */
const TITLE = "Work";
/** Idle caret blinks this long after typing, then disappears (≤ 5 s: WCAG 2.2.2). */
const CARET_LINGER = 5000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms * (0.6 + Math.random() * 0.9);
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
  private readonly typedCount = signal(0);
  /** Typed part + still-invisible rest: the ghost keeps the line width stable. */
  readonly title = computed(() => {
    const n = this.typedCount();
    return {
      shown: TITLE.slice(0, n),
      hidden: TITLE.slice(n),
      dot: n > TITLE.length,
    };
  });
  /** Solid caret while keys are pressed, blinking while idle, gone 5 s after typing. */
  readonly typing = signal(false);
  readonly caret = signal(false);
  /** Title written: the rest of the hero (subtitle, log, cue) starts. */
  readonly done = signal(false);
  /** Bumped on pause/resume/destroy so a stale typing run stops. */
  private runId = 0;

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
    const injector = inject(Injector);
    inject(DestroyRef).onDestroy(() => this.runId++);

    afterNextRender(() => {
      effect(
        () => {
          const paused = this.motion.paused();
          untracked(() => {
            const id = ++this.runId;
            if (paused) this.showStatic();
            else if (!this.done()) void this.type(() => id === this.runId);
          });
        },
        { injector },
      );

      const fragment = this.route.snapshot.fragment;
      if (!fragment) return;
      setTimeout(() => {
        this.document.getElementById(fragment)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });
  }

  /** Reduced motion / paused: title fully written, no caret. */
  private showStatic(): void {
    this.typedCount.set(TITLE.length + 1);
    this.typing.set(false);
    this.caret.set(false);
    this.done.set(true);
  }

  private async type(alive: () => boolean): Promise<void> {
    this.typedCount.set(0);
    this.typing.set(true); // solid caret on the empty line, then keys
    this.caret.set(true);
    await sleep(500);
    if (!alive()) return;
    for (let i = 1; i <= TITLE.length; i++) {
      this.typedCount.set(i);
      await sleep(TITLE[i - 1] === " " ? 220 : jitter(110));
      if (!alive()) return;
    }
    await sleep(260); // short beat before the full stop
    if (!alive()) return;
    this.typedCount.set(TITLE.length + 1);
    this.typing.set(false);
    this.done.set(true);
    // idle tick-tick for a while, then the caret goes away: less intrusive
    await sleep(CARET_LINGER);
    if (alive()) this.caret.set(false);
  }

  /**
   * "Read the full log" cue: smooth scroll to the experiences, stopping below the fixed
   * navbar. Hand-rolled like the Home / Contact cues (scrollIntoView's smooth mode is
   * instant in some browsers/OS settings); the app scrolls inside `.frame`.
   */
  jumpTo(target: HTMLElement): void {
    const scroller = target.closest<HTMLElement>(".frame");
    if (!scroller) return;

    const navbar = this.document.querySelector(".navbar-content");
    const navBottom = navbar ? navbar.getBoundingClientRect().bottom : 0;
    const gap = 24;

    const from = scroller.scrollTop;
    const to = Math.max(
      0,
      Math.min(
        from + target.getBoundingClientRect().top - navBottom - gap,
        scroller.scrollHeight - scroller.clientHeight,
      ),
    );

    const duration = 900;
    const start = performance.now();
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      scroller.scrollTop = from + (to - from) * ease(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
