import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';
import { LayoutModule } from '@angular/cdk/layout';

@Component({
  selector: 'app-about',
  imports: [CommonModule, LayoutModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isMedium$ = this.breakpointObserver
    .observe(['(min-width: 768px) and (max-width: 1279px)'])
    .pipe(map((result) => result.matches));

  downloadCV() {
    const link = document.createElement('a');
    link.href = 'assets/pdf/CV -Gabriele-Pinese.pdf';
    link.download = 'CV -Gabriele-Pinese.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
