import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { ContentService } from "../../core/services/content.service";
import { DOCUMENT, NgClass, isPlatformBrowser } from "@angular/common";
import { BreakpointObserver } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

@Component({
  selector: "app-contact",
  imports: [NgClass],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  readonly c = inject(ContentService).c;
  private breakpointObserver = inject(BreakpointObserver);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private btnParallaxCleanup?: () => void;

  readonly showFallback = signal(false);
  readonly emailCopied = signal(false);

  readonly isMedium = toSignal(
    this.breakpointObserver
      .observe(["(min-width: 768px) and (max-width: 1279px)"])
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initBtnParallax();
    }
  }

  private initBtnParallax() {
    const btn = document.querySelector<HTMLElement>(".contact-btn");
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
    this.btnParallaxCleanup?.();
  }

  sendMail() {
    if (isPlatformBrowser(this.platformId)) {
      this.document.location.href =
        "mailto:gabrielepinese97@gmail.com?subject=Portfolio%20Request&body=";
      this.showFallback.set(true);
    }
  }

  copyEmail() {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText("gabrielepinese97@gmail.com").then(() => {
        this.emailCopied.set(true);
        setTimeout(() => this.emailCopied.set(false), 2000);
      });
    }
  }
}
