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

  codeKeywords = [
    {
      text: "Angular",
      x: "4%",
      y: "12%",
      delay: "0s",
      size: "14px",
      opacity: "0.28",
      duration: "9s",
    },
    {
      text: "TypeScript",
      x: "72%",
      y: "6%",
      delay: "1.5s",
      size: "16px",
      opacity: "0.22",
      duration: "11s",
    },
    {
      text: "Observable",
      x: "58%",
      y: "62%",
      delay: "0.5s",
      size: "12px",
      opacity: "0.18",
      duration: "13s",
    },
    {
      text: "@Component",
      x: "14%",
      y: "68%",
      delay: "2s",
      size: "13px",
      opacity: "0.2",
      duration: "10s",
    },
    {
      text: "SCSS",
      x: "84%",
      y: "42%",
      delay: "1s",
      size: "22px",
      opacity: "0.2",
      duration: "8s",
    },
    {
      text: "inject()",
      x: "44%",
      y: "78%",
      delay: "3s",
      size: "13px",
      opacity: "0.15",
      duration: "12s",
    },
    {
      text: "RxJS",
      x: "26%",
      y: "36%",
      delay: "0.8s",
      size: "24px",
      opacity: "0.12",
      duration: "7s",
    },
    {
      text: "signal()",
      x: "68%",
      y: "82%",
      delay: "2.5s",
      size: "13px",
      opacity: "0.18",
      duration: "14s",
    },
    {
      text: ".pipe()",
      x: "6%",
      y: "52%",
      delay: "1.2s",
      size: "15px",
      opacity: "0.2",
      duration: "10s",
    },
    {
      text: "async/await",
      x: "86%",
      y: "68%",
      delay: "0.3s",
      size: "12px",
      opacity: "0.15",
      duration: "11s",
    },
    {
      text: "ngFor",
      x: "36%",
      y: "18%",
      delay: "1.8s",
      size: "15px",
      opacity: "0.18",
      duration: "9s",
    },
    {
      text: "computed()",
      x: "50%",
      y: "46%",
      delay: "2.2s",
      size: "12px",
      opacity: "0.12",
      duration: "15s",
    },
  ];

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
