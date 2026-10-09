import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TerminalCardComponent } from "./terminal-card/terminal-card.component";
import { injectIsMediumBreakpoint } from "../../shared/utils/breakpoint";
import { MagneticButtonDirective } from "../../shared/directives/magnetic-button.directive";

interface StackItem {
  icon?: string;
  imgSrc?: string;
  label: string;
}

@Component({
  selector: "app-about",
  imports: [TerminalCardComponent, MagneticButtonDirective],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly isMedium = injectIsMediumBreakpoint();

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

  constructor() {
    afterNextRender(() => {
      this.loadDevicons();
      this.initScrollReveal();
    });
  }

  private loadDevicons() {
    if (this.document.querySelector('link[href*="devicons"]')) return;
    const link = this.document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css";
    this.document.head.appendChild(link);
  }

  private initScrollReveal() {
    const frameEl = this.document.querySelector(".frame");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 80px 0px", root: frameEl },
    );

    const frameRect = frameEl?.getBoundingClientRect();
    this.document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const frameTop = frameRect?.top ?? 0;
      if (rect.bottom < frameTop) {
        el.classList.add("visible");
      } else {
        observer.observe(el);
      }
    });

    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  downloadCV() {
    const link = this.document.createElement("a");
    link.href = "assets/pdf/Gabriele_Pinese_CV.pdf";
    link.download = "Gabriele_Pinese_CV.pdf";
    this.document.body.appendChild(link);
    link.click();
    this.document.body.removeChild(link);
  }
}
