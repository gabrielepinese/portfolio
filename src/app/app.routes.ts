import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((mod) => mod.HomeComponent),
    data: { animation: 'HomePage' },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((mod) => mod.AboutComponent),
    data: { animation: 'AboutPage' },
  },
];
