import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { injectIsMobile } from "../../utils/breakpoint";
import { easeOutCubic, scrollBelowNavbar } from "../../utils/scroll";

let nextId = 0;

/**
 * One experience on the Works timeline.
 * - Tablet / desktop: the whole card is a link to the company site.
 * - Phones: an accordion. The header toggles the details (description, chips, site link);
 *   the parent decides which one is open (`open` / `toggle`), so opening one closes the others.
 */
@Component({
  selector: "app-item-list",
  imports: [NgTemplateOutlet],
  templateUrl: "./item-list.component.html",
  styleUrl: "./item-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemListComponent {
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  link = input.required<string>();
  from = input.required<string>();
  to = input.required<string>();
  company = input.required<string>();
  title = input.required<string>();
  desc = input.required<string>();
  chips = input.required<string[]>();
  /** Current role: the timeline node is HEAD (filled, pulsing) and gets a badge. */
  current = input(false);
  /** Phones only: details expanded. */
  open = input(false);
  /** Phones only: the header was tapped; the parent flips `open`. */
  readonly toggle = output<void>();

  readonly mobile = injectIsMobile();
  readonly bodyId = `item-body-${nextId++}`;

  goto(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  onToggle(): void {
    const opening = !this.open();
    this.toggle.emit();
    // Opening this one collapses the one above: the page shrinks and this header can slide
    // up under the navbar. Once the height transition is over, bring it back into view.
    if (opening) setTimeout(() => this.keepInView(), 420);
  }

  private keepInView(): void {
    scrollBelowNavbar(this.host, { gap: 16, duration: 450, ease: easeOutCubic, onlyIfHidden: true });
  }
}
