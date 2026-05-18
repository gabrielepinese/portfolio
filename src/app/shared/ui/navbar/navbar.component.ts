import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import {
  DOCUMENT,
  NgClass,
  NgStyle,
  NgTemplateOutlet,
  isPlatformBrowser,
} from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";
import { NavigationService } from "../../../core/services/navigation.service";

@Component({
  selector: "app-navbar",
  imports: [NgClass, NgStyle, NgTemplateOutlet],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly routeColor = signal<string | undefined>(undefined);
  readonly menuOpen = signal(false);
  readonly currentRoute = signal<string>('');

  get transitionColor() { return this.navService.transitionColor; }
  get startTransition() { return this.navService.startTransition; }
  get showDots() { return this.navService.showDots; }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private navService: NavigationService,
  ) {
    this.routeColor.set(
      this.getChild(this.activatedRoute).snapshot.data["color"],
    );
    this.currentRoute.set(this.router.url.replace(/^\/+/, '') || 'home');

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.routeColor.set(
          this.getChild(this.activatedRoute).snapshot.data["color"],
        );
        this.currentRoute.set(this.router.url.replace(/^\/+/, '') || 'home');
      });
  }

  private getChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  navigate(path: string) {
    const isSameRoute = this.currentRoute() === path;
    this.navService.navigate(path, () => {
      if (this.menuOpen()) this.toggleMenu();
    });

    if (!isSameRoute) {
      setTimeout(() => {
        this.menuOpen.set(false);
      }, 1000);
    }
  }

  toggleMenu() {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      if (isPlatformBrowser(this.platformId)) {
        this.document.body.style.overflow = "";
      }
    } else {
      if (isPlatformBrowser(this.platformId)) {
        this.document.body.style.overflow = "hidden";
      }
      this.menuOpen.set(true);
    }
  }
}
