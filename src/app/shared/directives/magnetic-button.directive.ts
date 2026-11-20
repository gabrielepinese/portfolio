import { afterNextRender, Directive, DestroyRef, ElementRef, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";

/**
 * Makes a button float a few px toward the cursor on hover (CSS custom props
 * --float-x/--float-y). Mouse / fine pointers only; the button's box is measured once per
 * hover (not on every move) and writes are batched to one per frame.
 */
@Directive({
  selector: "[appMagneticButton]",
})
export class MagneticButtonDirective {
  constructor() {
    const button = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const win = inject(DOCUMENT).defaultView;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!win?.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      let rect: DOMRect | null = null;
      let frame = 0;
      let x = 0;
      let y = 0;

      const write = () => {
        frame = 0;
        button.style.setProperty("--float-x", `${x}px`);
        button.style.setProperty("--float-y", `${y}px`);
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(write);
      };

      const onEnter = () => (rect = button.getBoundingClientRect());
      const onMove = (e: PointerEvent) => {
        rect ??= button.getBoundingClientRect();
        x = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 5;
        y = ((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 5;
        schedule();
      };
      const onLeave = () => {
        rect = null;
        x = y = 0;
        schedule();
      };

      button.addEventListener("pointerenter", onEnter);
      button.addEventListener("pointermove", onMove, { passive: true });
      button.addEventListener("pointerleave", onLeave);

      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        button.removeEventListener("pointerenter", onEnter);
        button.removeEventListener("pointermove", onMove);
        button.removeEventListener("pointerleave", onLeave);
      });
    });
  }
}
