import { ApplicationConfig, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter, withPreloading } from "@angular/router";
import { routes } from "./app.routes";
import { IdlePreloadingStrategy } from "./core/idle-preloading.strategy";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // pages are lazy chunks; the others are fetched when the browser is idle
    provideRouter(routes, withPreloading(IdlePreloadingStrategy)),
  ],
};
