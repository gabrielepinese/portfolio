import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";

@Component({
  selector: "app-navbar",
  imports: [],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);

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

  private deepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  navigate(path: string) {
    if (this.currentRoute() === path) {
      this.toggleMenu();
      return;
    }

    this.transitionColor.set(this.routeColors[path] ?? "#000");
    this.startTransition.set(true);

    clearTimeout(this.dotsTimer);
    this.dotsTimer = setTimeout(() => this.showDots.set(true), 500);

    setTimeout(() => this.menuOpen.set(false), 1000);

    this.document.body.style.overflow = "";

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
    const open = !this.menuOpen();
    this.menuOpen.set(open);
    this.document.body.style.overflow = open ? "hidden" : "";
  }
}
