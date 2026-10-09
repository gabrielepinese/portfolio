import { inject, Signal } from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

/** Signal that is true between tablet and small-desktop widths (768–1279px). */
export function injectIsMediumBreakpoint(): Signal<boolean> {
  const breakpointObserver = inject(BreakpointObserver);

  return toSignal(
    breakpointObserver
      .observe(["(min-width: 768px) and (max-width: 1279px)"])
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );
}
