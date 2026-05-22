import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NavigationService } from "../../core/services/navigation.service";
import { ContentService } from "../../core/services/content.service";

@Component({
  selector: "app-home",
  imports: [],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly c = inject(ContentService).c;

  constructor(private navService: NavigationService) {}

  goToWorks() {
    this.navService.navigate("works");
  }
}
