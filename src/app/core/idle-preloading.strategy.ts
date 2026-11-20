import { Injectable } from "@angular/core";
import { PreloadingStrategy, Route } from "@angular/router";
import { Observable, of, switchMap, timer } from "rxjs";

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Preloads the other pages' chunks only once the browser is idle (after the first page
 * has rendered and its entrance animations have started), instead of all at once at
 * boot like PreloadAllModules, so they never compete with the visible page for the
 * network or the main thread. Skipped on Save-Data and 2G connections: there the chunk
 * is fetched on navigation, behind the route curtain.
 */
@Injectable({ providedIn: "root" })
export class IdlePreloadingStrategy implements PreloadingStrategy {
  preload(_route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (typeof window === "undefined") return of(null);
    const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")) return of(null);

    const idle = new Observable<void>((sub) => {
      const done = () => {
        sub.next();
        sub.complete();
      };
      if ("requestIdleCallback" in window) {
        const id = requestIdleCallback(done, { timeout: 4000 });
        return () => cancelIdleCallback(id);
      }
      const id = setTimeout(done, 2000); // Safari: no requestIdleCallback
      return () => clearTimeout(id);
    });

    // a short head start for the current page, then one idle slot per route
    return timer(1500).pipe(
      switchMap(() => idle),
      switchMap(() => load()),
    );
  }
}
