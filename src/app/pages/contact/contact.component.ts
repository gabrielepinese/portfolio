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
} from '@angular/core';
import { MotionService } from '../../shared/services/motion.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { HttpClientComponent } from './http-client/http-client.component';

/** Typed title; a page-coloured "." is typed after it (like "About me." / "Work."). */
const TITLE = 'Contact me';
/** Idle caret blinks this long after typing, then disappears (≤ 5 s: WCAG 2.2.2). */
const CARET_LINGER = 5000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms * (0.6 + Math.random() * 0.9);
const SUBTITLE =
  "Got a project, an idea, or just curious? Reach out — I'm always happy to connect, especially if you work in payments or fintech.";

@Component({
  selector: 'app-contact',
  imports: [RevealDirective, HttpClientComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly motion = inject(MotionService);

  // ── typewriter title (same feel as the Home headline) ──
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
  /** Title written: the rest of the hero (subtitle, chat, cue) starts. */
  readonly done = signal(false);
  /** Bumped on pause/resume/destroy so a stale typing run stops. */
  private runId = 0;

  readonly subtitle = SUBTITLE;
  readonly subtitleWords = SUBTITLE.split(' ');

  /**
   * Hero chat, seen from the visitor's side, played once. `at` = second the typing dots
   * appear; the bubble replaces them 0.7 s later. `seen` = when the "Seen" receipt shows
   * under the visitor's last message. Times count from the end of the typed title; the
   * whole hero settles ≈ 5 s after load (WCAG 2.2.2: no pause control needed).
   */
  readonly chat = [
    { text: 'Hi Gabriele 👋', mine: true, at: 0.4 },
    {
      text: "Got a minute? I have an idea I'd love to build.",
      mine: true,
      at: 1.0,
    },
    { text: 'Always. Tell me everything', mine: false, at: 2.0 },
  ];
  readonly seenAt = 1.8;

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
      await sleep(TITLE[i - 1] === ' ' ? 220 : jitter(95));
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
   * "New message" cue: smooth scroll to the text + form section, stopping below the
   * fixed navbar. Hand-rolled like the Home cue (scrollIntoView's smooth mode is
   * instant in some browsers/OS settings); the app scrolls inside `.frame`.
   */
  jumpToForm(target: HTMLElement): void {
    const scroller = target.closest<HTMLElement>('.frame');
    if (!scroller) return;

    const navbar = document.querySelector('.navbar-content');
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
    const ease = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      scroller.scrollTop = from + (to - from) * ease(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
