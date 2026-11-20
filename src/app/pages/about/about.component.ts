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
import { injectIsMediumBreakpoint } from "../../shared/utils/breakpoint";
import { MagneticButtonDirective } from "../../shared/directives/magnetic-button.directive";
import { RevealDirective } from "../../shared/directives/reveal.directive";
import { MotionService } from "../../shared/services/motion.service";
import { SketchpadComponent } from "./sketchpad/sketchpad.component";
import { IllustrationComponent } from "./illustration/illustration.component";

/** Typed title; a page-coloured "." is typed after it (like "Work." / "Contact me."). */
const TITLE = "About me";
/** Idle caret blinks this long after typing, then disappears (≤ 5 s: WCAG 2.2.2). */
const CARET_LINGER = 5000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms * (0.6 + Math.random() * 0.9);
const SUBTITLE =
  "What excites me most about software engineering is following a problem end-to-end — from the interface down to the data behind it — and building systems people can rely on.";

interface StackItem {
  icon?: string;
  imgSrc?: string;
  label: string;
}

/** One syntax-coloured token of the hero editor. */
interface Token {
  k: "kw" | "var" | "prop" | "str" | "op" | "cm" | "type";
  t: string;
}

@Component({
  selector: "app-about",
  imports: [MagneticButtonDirective, RevealDirective, SketchpadComponent, IllustrationComponent],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(MotionService);

  readonly isMedium = injectIsMediumBreakpoint();

  // ── typewriter title (same feel as the Home / Contact / Work headlines) ──
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
  /** Title written: the rest of the hero (subtitle, editor, cue) starts. */
  readonly done = signal(false);
  /** Bumped on pause/resume/destroy so a stale typing run stops. */
  private runId = 0;

  readonly subtitle = SUBTITLE;
  readonly subtitleWords = SUBTITLE.split(" ");

  /**
   * Hero editor: a `profile.ts` written line by line (each line fades in at `--t`, see
   * SCSS). Decorative: the sections below say the same in plain words.
   */
  readonly code: { indent?: boolean; tokens: Token[] }[] = [
    { tokens: [{ k: "cm", t: "// who's behind the code" }] },
    {
      tokens: [
        { k: "kw", t: "export const " },
        { k: "var", t: "me" },
        { k: "op", t: " = {" },
      ],
    },
    { indent: true, tokens: [{ k: "prop", t: "name" }, { k: "op", t: ": " }, { k: "str", t: '"Gabriele Pinese"' }, { k: "op", t: "," }] },
    { indent: true, tokens: [{ k: "prop", t: "role" }, { k: "op", t: ": " }, { k: "str", t: '"Software Engineer"' }, { k: "op", t: "," }] },
    { indent: true, tokens: [{ k: "prop", t: "based" }, { k: "op", t: ": " }, { k: "str", t: '"Milan, Italy"' }, { k: "op", t: "," }] },
    { indent: true, tokens: [{ k: "prop", t: "studied" }, { k: "op", t: ": " }, { k: "str", t: '"University of Milan"' }, { k: "op", t: "," }] },
    {
      indent: true,
      tokens: [
        { k: "prop", t: "cares" },
        { k: "op", t: ": [" },
        { k: "str", t: '"correctness"' },
        { k: "op", t: ", " },
        { k: "str", t: '"reliability"' },
        { k: "op", t: "]," },
      ],
    },
    { indent: true, tokens: [{ k: "prop", t: "next" }, { k: "op", t: ": " }, { k: "str", t: '"digital payments"' }, { k: "op", t: "," }] },
    { indent: true, tokens: [{ k: "prop", t: "offline" }, { k: "op", t: ": " }, { k: "str", t: '"drawing ✎"' }, { k: "op", t: "," }] },
    {
      tokens: [
        { k: "op", t: "} " },
        { k: "kw", t: "satisfies " },
        { k: "type", t: "Human" },
        { k: "op", t: ";" },
      ],
    },
  ];
  /** Seconds (after the title) at which the first code line prints, and the gap between lines. */
  readonly codeStart = 0.6;
  readonly codeStep = 0.2;

  readonly STACK: StackItem[] = [
    { icon: "devicon-angular-plain", label: "Angular" },
    { icon: "devicon-typescript-plain colored", label: "TypeScript" },
    { icon: "devicon-react-original colored", label: "React" },
    { imgSrc: "assets/icon/java.svg", label: "Java" },
    { imgSrc: "assets/icon/kotlin.svg", label: "Kotlin" },
    { icon: "devicon-csharp-plain colored", label: "C#" },
    { icon: "devicon-tailwindcss-plain colored", label: "Tailwind" },
    { icon: "devicon-git-plain colored", label: "Git" },
    { icon: "devicon-figma-plain colored", label: "Figma" },
    { imgSrc: "assets/icon/zed.webp", label: "Zed" },
  ];

  constructor() {
    const injector = inject(Injector);
    inject(DestroyRef).onDestroy(() => this.runId++);

    afterNextRender(() => {
      this.loadDevicons();
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
      await sleep(TITLE[i - 1] === " " ? 220 : jitter(100));
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

  private loadDevicons() {
    if (this.document.querySelector('link[href*="devicon"]')) return;
    const link = this.document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css";
    this.document.head.appendChild(link);
  }

  /**
   * "Open README" cue: smooth scroll to the story section, stopping below the fixed
   * navbar. Hand-rolled like the Home / Contact / Work cues (scrollIntoView's smooth mode
   * is instant in some browsers/OS settings); the app scrolls inside `.frame`.
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

  downloadCV() {
    const link = this.document.createElement("a");
    link.href = "assets/pdf/Gabriele_Pinese_CV.pdf";
    link.download = "Gabriele_Pinese_CV.pdf";
    this.document.body.appendChild(link);
    link.click();
    this.document.body.removeChild(link);
  }
}
