import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { DOCUMENT, NgClass, NgTemplateOutlet } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";
import { PageTransitionService } from "../../services/page-transition.service";

@Component({
  selector: "app-navbar",
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  protected readonly pageTransition = inject(PageTransitionService);

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
  );

  readonly routeColor = computed<string | undefined>(() => {
    this.navigationEnd();
    return this.deepestChild(this.activatedRoute).snapshot.data["color"];
  });

  readonly currentRoute = computed(() => {
    this.navigationEnd();
    return this.router.url.replace(/^\/+/, "") || "home";
  });

  readonly menuOpen = signal(false);

  private deepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  navigate(path: string) {
    if (this.currentRoute() === path) {
      this.toggleMenu();
      return;
    }

    setTimeout(() => this.menuOpen.set(false), 1000);
    this.document.body.style.overflow = "";

    this.pageTransition.navigate(path);
  }

  toggleMenu() {
    const open = !this.menuOpen();
    this.menuOpen.set(open);
    this.document.body.style.overflow = open ? "hidden" : "";
  }
}
