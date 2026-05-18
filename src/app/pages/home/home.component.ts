import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NavigationService } from "../../core/services/navigation.service";

@Component({
  selector: "app-home",
  imports: [],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  constructor(private navService: NavigationService) {}

  goToWorks() {
    this.navService.navigate('works', undefined, 'projects');
  }
}
