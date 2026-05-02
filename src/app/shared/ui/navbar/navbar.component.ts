import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { DOCUMENT, NgClass, NgStyle, NgTemplateOutlet, isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";

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
  readonly transitionColor = signal("");
  readonly startTransition = signal(false);
  readonly showDots = signal(false);

  private dotsTimer?: ReturnType<typeof setTimeout>;

  private readonly routeColors: Record<string, string> = {
    home: "#f1a661",
    about: "#aac4ff",
    works: "#d2665a",
    contact: "#c4d7b2",
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.routeColor.set(this.getChild(this.activatedRoute).snapshot.data["color"]);

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.routeColor.set(this.getChild(this.activatedRoute).snapshot.data["color"]);
      });
  }

  private getChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  navigate(path: string) {
    if (this.router.url.replace(/^\/+/, "") === path) {
      this.toggleMenu();
      return;
    }

    this.transitionColor.set(this.routeColors[path] ?? "#000");
    this.startTransition.set(true);

    clearTimeout(this.dotsTimer);
    this.dotsTimer = setTimeout(() => {
      this.showDots.set(true);
    }, 500);

    setTimeout(() => {
      this.menuOpen.set(false);
    }, 1000);

    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = "";
    }

    setTimeout(() => {
      this.router.navigateByUrl(path).then(() => {
        const frame = this.document.querySelector(".frame");
        if (frame) frame.scrollTop = 0;
        this.startTransition.set(false);
        this.showDots.set(false);
        clearTimeout(this.dotsTimer);
      });
    }, 800);
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
