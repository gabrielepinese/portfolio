import {
  ChangeDetectionStrategy,
  Component,
  inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
} from "@angular/core";
import { NgClass, isPlatformBrowser } from "@angular/common";
import { BreakpointObserver } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { TerminalCardComponent } from "./terminal-card/terminal-card.component";

interface StackItem {
  icon?: string;
  imgSrc?: string;
  label: string;
}

@Component({
  selector: "app-about",
  imports: [NgClass, TerminalCardComponent],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;
  private btnParallaxCleanup?: () => void;

  readonly isMedium = toSignal(
    this.breakpointObserver
      .observe(["(min-width: 768px) and (max-width: 1279px)"])
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  readonly STACK: StackItem[] = [
    { icon: "devicon-angular-plain colored", label: "Angular" },
    { icon: "devicon-typescript-plain colored", label: "TypeScript" },
    { icon: "devicon-react-original colored", label: "React" },
    { icon: "devicon-html5-plain colored", label: "HTML5" },
    { icon: "devicon-css3-plain colored", label: "CSS3" },
    { icon: "devicon-sass-original colored", label: "SCSS" },
    { icon: "devicon-tailwindcss-plain colored", label: "Tailwind" },
    { icon: "devicon-figma-plain colored", label: "Figma" },
    { icon: "devicon-git-plain colored", label: "Git" },
    { imgSrc: "assets/icon/zed.webp", label: "Zed" },
    { icon: "devicon-csharp-plain colored", label: "C#" },
  ];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollReveal();
      this.initBtnParallax();
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

  private initBtnParallax() {
    const btn = document.querySelector<HTMLElement>(".about-btn");
    if (!btn) return;

    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      btn.style.setProperty("--float-x", `${dx * 5}px`);
      btn.style.setProperty("--float-y", `${dy * 5}px`);
    };

    const onLeave = () => {
      btn.style.setProperty("--float-x", "0px");
      btn.style.setProperty("--float-y", "0px");
    };

    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);

    this.btnParallaxCleanup = () => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.btnParallaxCleanup?.();
  }

  downloadCV() {
    if (!isPlatformBrowser(this.platformId)) return;
    const link = document.createElement("a");
    link.href = "assets/pdf/CV -Gabriele-Pinese.pdf";
    link.download = "CV -Gabriele-Pinese.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
