import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  downloadCV() {
    const link = document.createElement('a');
    link.href = 'assets/pdf/CV -Gabriele-Pinese.pdf';
    link.download = 'CV -Gabriele-Pinese.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
