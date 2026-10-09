import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { PageTransitionService } from "../../shared/services/page-transition.service";

@Component({
  selector: "app-home",
  imports: [],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly pageTransition = inject(PageTransitionService);

  goToWorkProjects(): void {
    this.pageTransition.navigate("works", { fragment: "projects" });
  }
}
