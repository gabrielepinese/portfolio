import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";
import { PageTransitionService } from "../../services/page-transition.service";

@Component({
  selector: "app-navbar",
  imports: [NgTemplateOutlet],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(document:keydown)": "onKeydown($event)" },
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

  /** Social profiles shown at the top of the menu. */
  readonly socials = [
    { name: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/gabriele-pinese/" },
    { name: "instagram", label: "Instagram", url: "https://www.instagram.com/gabriele_pinese/" },
    { name: "facebook", label: "Facebook", url: "https://www.facebook.com/gabriele.pinese.9/" },
  ];

  /** Pages shown as files in the menu's project-tree list. */
  readonly menuItems = [
    { path: "home", label: "home", desc: "return to home page" },
    { path: "about", label: "about", desc: "something about me" },
    { path: "works", label: "works", desc: "find out what I can do" },
    { path: "contact", label: "contact", desc: "let's get in touch" },
  ];

  /** Element focused before the menu opened, to give focus back on close. */
  private lastFocus: HTMLElement | null = null;

  private deepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  constructor() {
    effect(() => this.document.body.classList.toggle("menu-open", this.menuOpen()));

    // The page scrolls inside `.frame`, so its scrollbar width varies by device
    // (17px on Windows, 0 on iPad/phones/macOS overlay scrollbars). Expose it as
    // --scrollbar-w so the fixed navbar can line up with the content on every device.
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const frame = this.document.querySelector<HTMLElement>(".frame");
      if (!frame) return;
      const root = this.document.documentElement;
      const measure = () =>
        root.style.setProperty("--scrollbar-w", `${frame.offsetWidth - frame.clientWidth}px`);
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(frame);
      const content = frame.querySelector(".app-layout");
      if (content) ro.observe(content);
      destroyRef.onDestroy(() => ro.disconnect());
    });
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

    if (open) {
      // move focus into the dialog (current page's entry, or the first one)
      this.lastFocus = this.document.activeElement as HTMLElement | null;
      setTimeout(() => {
        const current = this.document.querySelector<HTMLElement>(
          ".menu-container .tree-btn[aria-current='page']",
        );
        (current ?? this.document.querySelector<HTMLElement>(".menu-container .tree-btn"))?.focus();
      });
    } else {
      this.lastFocus?.focus();
      this.lastFocus = null;
    }
  }

  /** Menu shortcuts: 1–4 open a page, Esc closes. */
  onKeydown(e: KeyboardEvent): void {
    if (!this.menuOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") {
      e.preventDefault();
      this.toggleMenu();
      return;
    }
    const item = this.menuItems[Number(e.key) - 1];
    if (item) {
      e.preventDefault();
      this.navigate(item.path);
    }
  }
}
