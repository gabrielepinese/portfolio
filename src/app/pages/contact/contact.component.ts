import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from "@angular/core";
import { DOCUMENT, NgClass, isPlatformBrowser } from "@angular/common";
import { BreakpointObserver } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

@Component({
  selector: "app-contact",
  imports: [NgClass],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  readonly isMedium = toSignal(
    this.breakpointObserver
      .observe(["(min-width: 768px) and (max-width: 1279px)"])
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  sendMail() {
    if (isPlatformBrowser(this.platformId)) {
      this.document.location.href =
        "mailto:gabrielepinese97@gmail.com?subject=Portfolio%20Request&body=";
    }
  }
}
