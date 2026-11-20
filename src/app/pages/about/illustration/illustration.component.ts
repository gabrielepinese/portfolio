import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { MotionService } from "../../../shared/services/motion.service";

/**
 * About "how I build" illustrations: monochrome line art on a soft disc.
 *
 * Static by design; the only motion is depth: with a fine pointer the layers drift
 * with the mouse by different amounts (each layer has its own --dx/--dy, see SCSS),
 * eased by a slow transform transition. Off on touch and when motion is paused.
 * Decorative: the text next to it says the same thing.
 */
@Component({
  selector: "app-about-illustration",
  templateUrl: "./illustration.component.html",
  styleUrl: "./illustration.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[style.--mx]": "mx()", "[style.--my]": "my()" },
})
export class IllustrationComponent {
  readonly kind = input.required<"components" | "architecture">();
  /** Pointer position, -1 … 1 from the viewport centre. */
  protected readonly mx = signal(0);
  protected readonly my = signal(0);

  constructor() {
    const doc = inject(DOCUMENT);
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    // pausing motion recentres the layers straight away (not on the next mouse move)
    effect(() => {
      if (motion.paused()) {
        this.mx.set(0);
        this.my.set(0);
      }
    });

    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

    afterNextRender(() => {
      const win = doc.defaultView;
      if (!win || !win.matchMedia("(pointer: fine)").matches) return;

      let frame = 0;
      let x = 0;
      let y = 0;
      const apply = () => {
        frame = 0;
        if (motion.paused()) return;
        this.mx.set(Math.round(x * 1000) / 1000);
        this.my.set(Math.round(y * 1000) / 1000);
      };
      const onMove = (e: PointerEvent) => {
        x = (e.clientX / win.innerWidth) * 2 - 1;
        y = (e.clientY / win.innerHeight) * 2 - 1;
        if (!frame) frame = win.requestAnimationFrame(apply);
      };

      // listen to the pointer only while the illustration is on screen
      let listening = false;
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting === listening) return;
        listening = entry.isIntersecting;
        if (listening) win.addEventListener("pointermove", onMove, { passive: true });
        else win.removeEventListener("pointermove", onMove);
      });
      io.observe(host);

      destroyRef.onDestroy(() => {
        io.disconnect();
        win.removeEventListener("pointermove", onMove);
        if (frame) win.cancelAnimationFrame(frame);
      });
    });
  }
}
