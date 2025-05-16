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

  menuOpen = false;
  menuClosing = false;

  transitionColor = '';
  showRouteTransition = false;
  startTransition = false;

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

  getRouteColor(path: string): string {
    const routeColors: { [key: string]: string } = {
      home: '#f1a661',
      about: '#aac4ff',
      skills: '#d2665a',
      contact: '#c4d7b2',
    };

    return routeColors[path] || '#000';
  }

  navigate(path: string) {
    const currentPath = this.router.url.replace(/^\/+/, '');

    if (currentPath === path) {
      this.toggleMenu();
      return;
    }

    this.transitionColor = this.getRouteColor(path);
    this.showRouteTransition = true;
    this.startTransition = true;

    setTimeout(() => {
      this.toggleMenu();
    }, 300);

    setTimeout(() => {
      this.router.navigateByUrl(path).then(() => {
        const frame = document.querySelector('.frame');
        if (frame) {
          frame.scrollTop = 0; // Scorrimento istantaneo
        }
      });
      this.showRouteTransition = false;
      this.startTransition = false;
    }, 800);
  }

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
}
