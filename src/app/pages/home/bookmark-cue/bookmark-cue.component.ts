import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

/**
 * Scroll cue shaped like a fabric bookmark ribbon peeking out from under the hero board.
 * It sways gently; on hover/focus it gets "pulled" down and shows its label;
 * clicking emits `jump` so the page can scroll to the next section.
 */
@Component({
  selector: "app-bookmark-cue",
  template: `
    <button type="button" class="bookmark" (click)="jump.emit()">
      <!-- two layers: the drop-in plays once, the sway can stop on hover without restarting it -->
      <span class="ribbon-drop" aria-hidden="true">
        <span class="ribbon">
          <span class="ribbon-arrow">↓</span>
        </span>
      </span>
      <span class="bookmark-label"><span class="sr-only">Scroll to </span>{{ label() }}</span>
    </button>
  `,
  styleUrl: "./bookmark-cue.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkCueComponent {
  readonly label = input("what i do");
  readonly jump = output<void>();
}
