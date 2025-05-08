import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  blobPath1 = 'M0,0 C500,200 1000,0 1500,200 L1500,1000 L0,1000 Z';
  blobPath2 = 'M0,50 C500,250 1000,50 1500,250 L1500,1000 L0,1000 Z';
  blobPath3 = 'M0,100 C500,300 1000,100 1500,300 L1500,1000 L0,1000 Z';
}
