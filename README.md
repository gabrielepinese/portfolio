# Gabriele Pinese — Portfolio

Personal portfolio built with Angular 21. Features SSR, lazy-loaded routes, scroll-reveal animations, and a custom navigation system with page transitions.

## Stack

- **Angular 21** — standalone components, signals, OnPush
- **TypeScript 5.9** 
- **SCSS** — custom design system (typography scale, color variables, responsive mixins)
- **Angular CDK** — BreakpointObserver
- **Angular SSR** — prerendering + Express server

## Pages

| Route | Description |
|-------|-------------|
| `/home` | Landing page |
| `/about` | Profile, tech stack, skills, CV download |
| `/works` | Work experience list |
| `/contact` | Contact CTA |

## Performance

- All page routes lazy-loaded via `loadComponent`
- `PreloadAllModules` strategy for background prefetch
- Devicons CSS injected dynamically only on `/about`
- Images use `loading="lazy"`

## Accessibility

- Skip navigation link
- `<main>` landmark with `id="main-content"`
- Navbar: `aria-expanded`, `aria-current="page"`, `role="dialog"` on menu overlay
- Decorative elements: `aria-hidden="true"`

## Dev

```bash
npm install
npm start           # dev server → http://localhost:4200
npm run build       # production build → dist/
npm run serve:ssr:AngularPortfolio   # SSR server
```

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── home/
│   │   ├── about/
│   │   ├── works/
│   │   └── contact/
│   ├── shared/
│   │   └── ui/
│   │       ├── navbar/
│   │       └── item-list/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
└── assets/
    ├── color/
    ├── fonts/
    ├── images/
    └── styles/
```
