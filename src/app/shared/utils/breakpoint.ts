import { DestroyRef, inject, Signal, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";

/**
 * Signal mirroring a media query. Plain `matchMedia` + one `change` listener: no CDK
 * BreakpointObserver / RxJS in the page chunks. `false` on the server.
 */
export function injectMediaQuery(query: string): Signal<boolean> {
  const win = inject(DOCUMENT).defaultView;
  const mql = win?.matchMedia?.(query);
  const matches = signal(mql?.matches ?? false);
  if (mql) {
    const onChange = (e: MediaQueryListEvent) => matches.set(e.matches);
    mql.addEventListener("change", onChange);
    inject(DestroyRef).onDestroy(() => mql.removeEventListener("change", onChange));
  }
  return matches.asReadonly();
}

/** True between tablet and small-desktop widths (768–1279px). */
export const injectIsMediumBreakpoint = () => injectMediaQuery("(min-width: 768px) and (max-width: 1279px)");

/** True on phone widths (≤767px, same as the SCSS "md" breakpoint). */
export const injectIsMobile = () => injectMediaQuery("(max-width: 767px)");
