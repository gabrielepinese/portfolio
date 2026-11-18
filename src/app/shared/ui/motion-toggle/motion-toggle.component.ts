import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MotionService } from "../../services/motion.service";

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
})
export class MotionToggleComponent {
  protected readonly motion = inject(MotionService);
}
