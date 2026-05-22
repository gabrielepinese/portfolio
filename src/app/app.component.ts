import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./shared/ui/navbar/navbar.component";
import { ContentService } from "./core/services/content.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  readonly c = inject(ContentService).c;
  readonly currentYear = new Date().getFullYear();
}
