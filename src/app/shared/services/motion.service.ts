import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { effect, inject, Injectable, PLATFORM_ID, signal } from "@angular/core";

const STORAGE_KEY = "motion-paused";

/**
 * Global "pause animations" switch (WCAG 2.2.2 Pause, Stop, Hide).
 *
 * - Starts paused when the OS asks for reduced motion, unless the visitor
 *   explicitly turned animations back on (their choice is remembered).
 * - Adds `motion-paused` to <html> so CSS can freeze/skip animations, and
 *   exposes `paused` for JS-driven ones (canvas, typewriters).
 */
@Injectable({ providedIn: "root" })
export class MotionService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly paused = signal(this.initialState());

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle("motion-paused", this.paused());
    });
  }

  toggle(): void {
    this.paused.update((p) => !p);
    try {
      localStorage.setItem(STORAGE_KEY, String(this.paused()));
    } catch {
      // storage unavailable (private mode, blocked): the choice just isn't remembered
    }
  }

  private initialState(): boolean {
    if (!this.isBrowser) return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return saved === "true";
    } catch {
      // ignore, fall back to the OS preference
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
}
