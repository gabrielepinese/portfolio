import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { injectIsMediumBreakpoint } from "../../shared/utils/breakpoint";
import { MagneticButtonDirective } from "../../shared/directives/magnetic-button.directive";

@Component({
  selector: "app-contact",
  imports: [MagneticButtonDirective],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly document = inject(DOCUMENT);

  readonly showFallback = signal(false);
  readonly emailCopied = signal(false);
  readonly isMedium = injectIsMediumBreakpoint();

  sendMail() {
    this.document.location.href =
      "mailto:gabrielepinese97@gmail.com?subject=Portfolio%20Request&body=";
    this.showFallback.set(true);
  }

  copyEmail() {
    navigator.clipboard.writeText("gabrielepinese97@gmail.com").then(() => {
      this.emailCopied.set(true);
      setTimeout(() => this.emailCopied.set(false), 2000);
    });
  }
}
