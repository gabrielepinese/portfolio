import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BreakpointObserver } from "@angular/cdk/layout";
import { map } from "rxjs";

@Component({
  selector: "app-contact",
  imports: [CommonModule],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
})
export class ContactComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isMedium$ = this.breakpointObserver
    .observe(["(min-width: 768px) and (max-width: 1279px)"])
    .pipe(map((result) => result.matches));

  sendMail() {
    window.location.href =
      "mailto:gabrielepinese97@gmail.com?subject=Portfolio%20Request&body=";
  }
}
