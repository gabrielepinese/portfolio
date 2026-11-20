import { afterNextRender, computed, DestroyRef, effect, inject, Injector, Signal, signal, untracked } from "@angular/core";
import { MotionService } from "../services/motion.service";

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** Human-ish key timing: 60%–150% of `ms`. */
export const jitter = (ms: number) => ms * (0.6 + Math.random() * 0.9);

/** Idle caret blinks this long after typing, then disappears (≤ 5 s: WCAG 2.2.2). */
const CARET_LINGER = 5000;

export interface TitleTypewriter {
  /** Typed part + still-invisible rest (the ghost keeps the line width stable) + full stop. */
  readonly title: Signal<{ shown: string; hidden: string; dot: boolean }>;
  /** Keys being pressed: solid caret. */
  readonly typing: Signal<boolean>;
  /** Caret visible (blinks while idle, gone 5 s after typing). */
  readonly caret: Signal<boolean>;
  /** Title written: the rest of the hero can start. */
  readonly done: Signal<boolean>;
}

/**
 * Page-hero headline typed in like the Home one: a solid caret on the empty line, the
 * text key by key, a beat, then a page-coloured full stop. With motion paused / reduced
 * the title is written at once. Must run in an injection context (field initialiser).
 */
export function injectTitleTypewriter(text: string, keyDelay = 100): TitleTypewriter {
  const motion = inject(MotionService);
  const injector = inject(Injector);

  const typedCount = signal(0);
  const typing = signal(false);
  const caret = signal(false);
  const done = signal(false);
  /** Bumped on pause/resume/destroy so a stale typing run stops. */
  let runId = 0;
  inject(DestroyRef).onDestroy(() => runId++);

  const showStatic = () => {
    typedCount.set(text.length + 1);
    typing.set(false);
    caret.set(false);
    done.set(true);
  };

  const type = async (alive: () => boolean) => {
    typedCount.set(0);
    typing.set(true);
    caret.set(true);
    await sleep(500);
    if (!alive()) return;
    for (let i = 1; i <= text.length; i++) {
      typedCount.set(i);
      await sleep(text[i - 1] === " " ? 220 : jitter(keyDelay));
      if (!alive()) return;
    }
    await sleep(260); // short beat before the full stop
    if (!alive()) return;
    typedCount.set(text.length + 1);
    typing.set(false);
    done.set(true);
    await sleep(CARET_LINGER);
    if (alive()) caret.set(false);
  };

  afterNextRender(() => {
    effect(
      () => {
        const paused = motion.paused();
        untracked(() => {
          const id = ++runId;
          if (paused) showStatic();
          else if (!done()) void type(() => id === runId);
        });
      },
      { injector },
    );
  });

  return {
    title: computed(() => {
      const n = typedCount();
      return { shown: text.slice(0, n), hidden: text.slice(n), dot: n > text.length };
    }),
    typing: typing.asReadonly(),
    caret: caret.asReadonly(),
    done: done.asReadonly(),
  };
}
