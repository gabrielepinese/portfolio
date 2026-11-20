import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from "@angular/core";

/**
 * One IntersectionObserver per threshold, shared by every [appReveal] on the page
 * (instead of one observer per element): the browser batches all the checks.
 */
const observers = new Map<number, IntersectionObserver>();

function observerFor(threshold: number): IntersectionObserver {
  let io = observers.get(threshold);
  if (!io) {
    io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in-view");
          obs.unobserve(e.target); // one-shot: revealed elements stay revealed
        }
      },
      { threshold },
    );
    observers.set(threshold, io);
  }
  return io;
}

/** Adds the `in-view` class the first time the element scrolls into view. */
@Directive({
  selector: "[appReveal]",
})
export class RevealDirective {
  readonly revealThreshold = input(0.15);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const io = observerFor(this.revealThreshold());
      io.observe(el);
      destroyRef.onDestroy(() => io.unobserve(el));
    });
  }
}
