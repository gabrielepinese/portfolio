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
  {
    path: 'skills',
    loadComponent: () =>
      import('./pages/skills/skills.component').then(
        (mod) => mod.SkillsComponent
      ),
    data: { animation: 'SkillsPage' },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (mod) => mod.ContactComponent
      ),
    data: { animation: 'ContactPage' },
  },
];
