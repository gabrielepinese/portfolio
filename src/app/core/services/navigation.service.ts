import { Inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class NavigationService {
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
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  navigate(path: string, onSameRoute?: () => void, fragment?: string) {
    if (this.router.url.replace(/^\/+/, "") === path) {
      onSameRoute?.();
      return;
    }

    this.transitionColor.set(this.routeColors[path] ?? "#000");
    this.startTransition.set(true);

    clearTimeout(this.dotsTimer);
    this.dotsTimer = setTimeout(() => {
      this.showDots.set(true);
    }, 500);

    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = "";
    }

    setTimeout(() => {
      this.router.navigateByUrl(path).then(() => {
        this.startTransition.set(false);
        this.showDots.set(false);
        clearTimeout(this.dotsTimer);

        setTimeout(() => {
          if (fragment) {
            const target = this.document.getElementById(fragment);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
          }
          const frame = this.document.querySelector(".frame");
          if (frame) frame.scrollTop = 0;
        }, 0);
      });
    }, 800);
  }
}
