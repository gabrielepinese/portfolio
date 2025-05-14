import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(private router: Router) {}

  //Navigate function, switch to another page
  navigate(path: string) {
    this.router.navigateByUrl(path);
    this.menuOpen = false;
  }

  menuOpen = false;
  menuClosing = false;

  toggleMenu() {
    if (this.menuOpen && !this.menuClosing) {
      this.menuClosing = true;
      setTimeout(() => {
        this.menuOpen = false;
        this.menuClosing = false;
      }, 300); // deve combaciare con la durata dell’animazione (0.3s)
    } else {
      this.menuOpen = true;
    }
  }

  // Funzione per alternare la visibilità della descrizione
  toggleDescription(section: string): void {
    this.showDescription[section] = !this.showDescription[section];
  }

  // Stato delle descrizioni
  showDescription: { [key: string]: boolean } = {
    home: false,
    about: false,
    contact: false,
  };
}
