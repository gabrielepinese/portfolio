import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((mod) => mod.HomeComponent),
    data: { color: 'homePage' },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((mod) => mod.AboutComponent),
    data: { color: 'aboutPage' },
  },
  {
    path: 'works',
    loadComponent: () =>
      import('./pages/works/works.component').then((mod) => mod.WorksComponent),
    data: { color: 'worksPage' },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (mod) => mod.ContactComponent
      ),
    data: { color: 'contactPage' },
  },
];
