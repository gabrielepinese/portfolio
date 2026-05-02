import {
  Component,
  inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { BreakpointObserver } from "@angular/cdk/layout";
import { map } from "rxjs";
import { LayoutModule } from "@angular/cdk/layout";
import { TerminalCardComponent } from "./terminal-card/terminal-card.component";

@Component({
  selector: "app-about",
  imports: [CommonModule, LayoutModule, TerminalCardComponent],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  isMedium$ = this.breakpointObserver
    .observe(["(min-width: 768px) and (max-width: 1279px)"])
    .pipe(map((result) => result.matches));

ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollReveal();
    }
  }

  private initScrollReveal() {
    const frameEl = document.querySelector(".frame") as Element | null;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            this.observer!.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 80px 0px", root: frameEl },
    );

    const frameRect = frameEl?.getBoundingClientRect();
    document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const frameTop = frameRect?.top ?? 0;
      if (rect.bottom < frameTop) {
        el.classList.add("visible");
      } else {
        this.observer!.observe(el);
      }
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  downloadCV() {
    const link = document.createElement("a");
    link.href = "assets/pdf/CV -Gabriele-Pinese.pdf";
    link.download = "CV -Gabriele-Pinese.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
