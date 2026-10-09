import { DOCUMENT } from "@angular/common";
import { Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";

/** Curtain color per destination route — shared by every trigger (navbar, in-page links, ...). */
export const ROUTE_TRANSITION_COLORS: Record<string, string> = {
  home: "#f1a661",
  about: "#aac4ff",
  works: "#d2665a",
  contact: "#c4d7b2",
};

/**
 * Drives the full-screen "curtain" route transition: cover the viewport,
 * navigate underneath it, then reveal. The overlay markup itself lives in
 * NavbarComponent's template (it's the one component mounted outside
 * `<router-outlet>`, so it survives the navigation), but any component can
 * trigger the same effect through this service instead of duplicating the
 * cover/wait/navigate/reveal choreography.
 */
@Injectable({ providedIn: "root" })
export class PageTransitionService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly startTransition = signal(false);
  readonly transitionColor = signal("");
  readonly showDots = signal(false);

  private dotsTimer?: ReturnType<typeof setTimeout>;

  navigate(path: string, options: { fragment?: string } = {}): void {
    this.transitionColor.set(ROUTE_TRANSITION_COLORS[path] ?? "#000");
    this.startTransition.set(true);

    clearTimeout(this.dotsTimer);
    this.dotsTimer = setTimeout(() => this.showDots.set(true), 500);

    setTimeout(() => {
      this.router.navigate([`/${path}`], { fragment: options.fragment }).then(() => {
        // A fragment target scrolls itself into view once it renders — only
        // snap to top here when there's no fragment to hand off to.
        if (!options.fragment) {
          const frame = this.document.querySelector(".frame");
          if (frame) frame.scrollTop = 0;
        }

        this.startTransition.set(false);
        this.showDots.set(false);
        clearTimeout(this.dotsTimer);
      });
    }, 800);
  }
}
