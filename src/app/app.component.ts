import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { slideInAnimation } from './animations/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [slideInAnimation],
})

/*trigger('routeAnimations', [
      // Home -> Qualsiasi: slide verso sinistra
      transition('HomePage => *', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              width: '100%',
            }),
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [style({ transform: 'translateX(100%)', opacity: 1 })],
          { optional: true }
        ),
        group([
          query(
            ':leave',
            [
              animate(
                '400ms ease',
                style({ transform: 'translateX(-100%)', opacity: 1 })
              ),
            ],
            { optional: true }
          ),
          query(
            ':enter',
            [
              animate(
                '400ms ease',
                style({ transform: 'translateX(0)', opacity: 1 })
              ),
            ],
            { optional: true }
          ),
        ]),
      ]),

      // Qualsiasi -> Home: slide verso destra
      transition('* => HomePage', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              width: '100%',
            }),
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [style({ transform: 'translateX(-100%)', opacity: 1 })],
          { optional: true }
        ),
        group([
          query(
            ':leave',
            [
              animate(
                '400ms ease',
                style({ transform: 'translateX(100%)', opacity: 1 })
              ),
            ],
            { optional: true }
          ),
          query(
            ':enter',
            [
              animate(
                '400ms ease',
                style({ transform: 'translateX(0)', opacity: 1 })
              ),
            ],
            { optional: true }
          ),
        ]),
      ]),
    ]),*/
export class AppComponent {
  title = 'AngularPortfolio';

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData?.['animation']; // && outlet.activatedRouteData['animation'];
  }
}
