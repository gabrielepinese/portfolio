import {
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  @ViewChild('observeTarget') observeTarget!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.observeTarget.nativeElement.classList.add('visible');
              observer.disconnect(); // opzionale: se vuoi osservarlo solo una volta
            }
          });
        },
        { threshold: 0.2 }
      );

      if (this.observeTarget?.nativeElement) {
        observer.observe(this.observeTarget.nativeElement);
      }
    }
  }
}
