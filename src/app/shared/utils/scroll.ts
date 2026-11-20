/** Cubic ease-in-out: long, calm scrolls (section cues). */
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Cubic ease-out: short corrections (keep something in view). */
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

export interface ScrollBelowNavbarOptions {
  /** Space left between the navbar's bottom edge and the target (px). */
  gap?: number;
  duration?: number;
  ease?: (x: number) => number;
  /** Do nothing if the target already sits below the navbar. */
  onlyIfHidden?: boolean;
  /** Jump instead of animating (motion paused / reduced). */
  instant?: boolean;
}

/**
 * Scrolls the app's scroller (`.frame`: the page scrolls inside it, not the window) so
 * `target` lands just below the fixed navbar, whatever its height at this breakpoint.
 * Hand-rolled rather than `scrollIntoView({ behavior: "smooth" })`, which is instant in
 * some browsers / OS settings and can't take the navbar offset into account.
 */
export function scrollBelowNavbar(target: HTMLElement, opts: ScrollBelowNavbarOptions = {}): void {
  const { gap = 24, duration = 900, ease = easeInOutCubic, onlyIfHidden = false, instant = false } = opts;
  const scroller = target.closest<HTMLElement>(".frame");
  if (!scroller) return;

  const navbar = target.ownerDocument.querySelector(".navbar-content");
  const navBottom = navbar ? navbar.getBoundingClientRect().bottom : 0;
  const top = target.getBoundingClientRect().top;
  if (onlyIfHidden && top >= navBottom + gap) return;

  const from = scroller.scrollTop;
  const to = Math.max(0, Math.min(from + top - navBottom - gap, scroller.scrollHeight - scroller.clientHeight));
  if (instant || duration <= 0) {
    scroller.scrollTop = to;
    return;
  }

  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    scroller.scrollTop = from + (to - from) * ease(p);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
