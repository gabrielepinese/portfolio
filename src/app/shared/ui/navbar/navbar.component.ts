import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  routeColor: string | undefined;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.getChild(this.activatedRoute);
        this.routeColor = currentRoute.snapshot.data['color'];
      });
  }

  getChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
  //Navigate function, switch to another page
  navigate(path: string) {
    this.toggleMenu();
    this.router.navigateByUrl(path);
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
