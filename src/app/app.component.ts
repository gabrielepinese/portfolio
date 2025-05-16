import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
//  animations: [slideInAnimation],
export class AppComponent {
  title = 'AngularPortfolio';

  // getRouteAnimationData(outlet: RouterOutlet) {
  //   return outlet && outlet.activatedRouteData?.['animation']; // && outlet.activatedRouteData['animation'];
  // }
}
