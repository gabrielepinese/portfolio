import { afterNextRender, Directive, DestroyRef, ElementRef, inject } from "@angular/core";

/** Makes a button float a few px toward the cursor on hover (CSS custom props --float-x/--float-y). */
@Directive({
  selector: "[appMagneticButton]",
})
export class MagneticButtonDirective {
  constructor() {
    const button = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const onMove = (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        button.style.setProperty("--float-x", `${dx * 5}px`);
        button.style.setProperty("--float-y", `${dy * 5}px`);
      };

      const onLeave = () => {
        button.style.setProperty("--float-x", "0px");
        button.style.setProperty("--float-y", "0px");
      };

      button.addEventListener("mousemove", onMove);
      button.addEventListener("mouseleave", onLeave);

      destroyRef.onDestroy(() => {
        button.removeEventListener("mousemove", onMove);
        button.removeEventListener("mouseleave", onLeave);
      });
    });
  }
}
