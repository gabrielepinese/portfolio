import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from "@angular/core";

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
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            el.classList.add("in-view");
            io.disconnect();
          }
        },
        { threshold: this.revealThreshold() },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
