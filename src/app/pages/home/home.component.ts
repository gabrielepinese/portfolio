import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { MotionService } from "../../shared/services/motion.service";
import { PageTransitionService } from "../../shared/services/page-transition.service";
import { MagneticButtonDirective } from "../../shared/directives/magnetic-button.directive";
import { RevealDirective } from "../../shared/directives/reveal.directive";
import { injectIsMobile } from "../../shared/utils/breakpoint";
import { jitter, sleep } from "../../shared/utils/typewriter";
import { scrollBelowNavbar } from "../../shared/utils/scroll";
import { CodeFieldComponent } from "./code-field/code-field.component";
import { CodeWindowComponent } from "./code-window/code-window.component";
import { BookmarkCueComponent } from "./bookmark-cue/bookmark-cue.component";
import { MotionToggleComponent } from "../../shared/ui/motion-toggle/motion-toggle.component";

interface Segment {
  text: string;
  cls?: string;
  br?: boolean;
}

interface SegmentView {
  br: boolean;
  cls: string;
  shown: string;
  hidden: string;
  caret: boolean;
}

type CaretAt = "comment" | "headline" | "rotator" | null;

const COMMENT = "// welcome.ts";

const HEADLINE: Segment[] = [
  { text: "Hello," },
  { text: "", br: true },
  { text: "I'm " },
  { text: "Gabriele", cls: "bold" },
  { text: ".", cls: "orangePrimary" },
];

const ROTATING = [
  "reliable software",
  "end-to-end features",
  "payment systems",
  "clean architectures",
  "scalable APIs",
];

const SUBTITLE =
  "I'm a **Software Engineer** who enjoys building reliable, well-architected software end-to-end, with a growing interest in **digital payments.**";

/** "a **b** c" → [{a}, {b, bold}, {c}] split per word */
function parseWords(text: string): { word: string; bold: boolean }[] {
  return text
    .split("**")
    .flatMap((chunk, i) =>
      chunk
        .split(" ")
        .filter(Boolean)
        .map((word) => ({ word, bold: i % 2 === 1 })),
    );
}


@Component({
  selector: "app-home",
  imports: [CodeFieldComponent, CodeWindowComponent, BookmarkCueComponent, MotionToggleComponent, RevealDirective, MagneticButtonDirective],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly pageTransition = inject(PageTransitionService);

  /** Phones get a different hero: full-bleed editor screen + a dedicated particle playground. */
  readonly isMobile = injectIsMobile();
  /** Phones: particle playground is opt-in via the "Run" button in the board header. */
  readonly playOpen = signal(false);
  private readonly playground = viewChild<ElementRef<HTMLElement>>("playground");
  private readonly sections = viewChild.required<ElementRef<HTMLElement>>("sections");

  readonly subtitleWords = parseWords(SUBTITLE);
  readonly subtitlePlain = SUBTITLE.replaceAll("**", "");

  private readonly headTotal = HEADLINE.reduce((n, s) => n + s.text.length, 0);

  private readonly commentTyped = signal(0);
  private readonly headTyped = signal(0);
  readonly rotText = signal("");
  readonly caretAt = signal<CaretAt>(null);
  /** solid caret while keys are being pressed, blinking when idle */
  readonly typing = signal(false);
  /** 0 = typing intro, 1 = headline done (subtitle, CTAs, pattern appear) */
  readonly stage = signal(0);

  /**
   * Header status: "typing…" only while the intro is written, then "saved" for good.
   * Deliberately NOT tied to `typing()`, which toggles every second or two in the
   * rotating-word loop and would make the status flicker.
   */
  readonly editing = computed(() => this.stage() < 1);

  readonly comment = computed(() => {
    const n = this.commentTyped();
    return { shown: COMMENT.slice(0, n), hidden: COMMENT.slice(n) };
  });

  readonly headline = computed<SegmentView[]>(() => {
    const typed = this.headTyped();
    const caretOn = this.caretAt() === "headline";
    let offset = 0;
    let caretPlaced = false;
    return HEADLINE.map((seg) => {
      const start = offset;
      offset += seg.text.length;
      const visible = Math.max(0, Math.min(seg.text.length, typed - start));
      const caret = caretOn && !caretPlaced && !seg.br && typed <= offset;
      if (caret) caretPlaced = true;
      return {
        br: !!seg.br,
        cls: seg.cls ?? "",
        shown: seg.text.slice(0, visible),
        hidden: seg.text.slice(visible),
        caret,
      };
    });
  });

  /** "Pause animations" switch (WCAG 2.2.2), also on by default with OS reduced motion. */
  readonly motion = inject(MotionService);
  /** Bumped on every pause/resume/destroy: any older typing run sees a stale id and stops. */
  private runId = 0;
  private introDone = false;

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
            else void this.play(() => id === this.runId);
          });
        },
        { injector },
      );
    });
  }

  /** Paused: everything fully written at once, no caret. */
  private showStatic(): void {
    this.commentTyped.set(COMMENT.length);
    this.headTyped.set(this.headTotal);
    this.rotText.set(ROTATING[0]);
    this.caretAt.set(null);
    this.typing.set(false);
    this.stage.set(1);
    this.introDone = true;
  }

  private async play(alive: () => boolean): Promise<void> {
    if (!this.introDone) {
      await sleep(900);
      if (!alive()) return;
      if (!(await this.playIntro(alive))) return;
    }
    await this.playRotator(alive);
  }

  /** Comment + headline. Resolves false if interrupted. */
  private async playIntro(alive: () => boolean): Promise<boolean> {
    // 1. comment line
    this.caretAt.set("comment");
    this.typing.set(true);
    for (let i = 1; i <= COMMENT.length; i++) {
      this.commentTyped.set(i);
      await sleep(jitter(45));
      if (!alive()) return false;
    }
    this.typing.set(false);
    await sleep(450);

    // 2. headline, slow and human
    this.caretAt.set("headline");
    this.typing.set(true);
    for (let i = 1; i <= this.headTotal; i++) {
      this.headTyped.set(i);
      const ch = this.headlineChar(i - 1);
      await sleep(ch === "," ? 380 : jitter(95));
      if (!alive()) return false;
    }
    this.typing.set(false);
    this.stage.set(1);
    this.introDone = true;
    await sleep(1100);
    return alive();
  }

  /** 3. rotating "gabriele.build(...)" loop: type, hold, delete, next */
  private async playRotator(alive: () => boolean): Promise<void> {
    this.caretAt.set("rotator");
    // resuming after a pause: the current word is already fully written
    const current = ROTATING.indexOf(this.rotText());
    for (let w = Math.max(0, current); alive(); w = (w + 1) % ROTATING.length) {
      const word = ROTATING[w];
      if (this.rotText() !== word) {
        this.typing.set(true);
        for (let i = 1; i <= word.length; i++) {
          this.rotText.set(word.slice(0, i));
          await sleep(jitter(70));
          if (!alive()) return;
        }
      }
      this.typing.set(false);
      await sleep(1800);
      this.typing.set(true);
      for (let i = word.length - 1; i >= 0; i--) {
        this.rotText.set(word.slice(0, i));
        await sleep(28);
        if (!alive()) return;
      }
      this.typing.set(false);
      await sleep(350);
    }
  }

  private headlineChar(index: number): string {
    return HEADLINE.map((s) => s.text).join("")[index];
  }

  goToWorkProjects(): void {
    this.pageTransition.navigate("works", { fragment: "projects" });
  }

  togglePlayground(): void {
    this.playOpen.update((open) => !open);
    if (this.playOpen()) {
      // bring it on screen once it has rendered
      setTimeout(() =>
        this.playground()?.nativeElement.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      );
    }
  }

  /** "What I do" cue: smooth scroll to the sections, below the fixed navbar. */
  scrollToSections(): void {
    scrollBelowNavbar(this.sections().nativeElement, { instant: this.motion.paused() });
  }

  goToAbout(): void {
    this.pageTransition.navigate("about");
  }
}
