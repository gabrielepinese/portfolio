import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MotionService } from "../../services/motion.service";
import { PageTransitionService } from "../../services/page-transition.service";

/** Floating "Pause / Play animations" switch (WCAG 2.2.2 Pause, Stop, Hide). */
@Component({
  selector: "app-motion-toggle",
  template: `
    <button type="button" class="motion-btn" [class.paused]="motion.paused()" (click)="motion.toggle()">
      <span class="motion-icon" aria-hidden="true"></span>
      {{ motion.paused() ? "Play animations" : "Pause animations" }}
    </button>
  `,
  styleUrl: "./motion-toggle.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // the route curtain sits below this fixed button: step aside while it covers the page
  host: { "[class.leaving]": "transition.startTransition()" },
})
export class MotionToggleComponent {
  protected readonly motion = inject(MotionService);
  protected readonly transition = inject(PageTransitionService);
}
