import {
  Component,
  ElementRef,
  HostListener,
  Input,
  inject,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Route, Router } from '@angular/router';
import { UtilityService } from 'src/app/core/services/utility.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input()
  styleEye: any;

  private breakpointObserver = inject(BreakpointObserver);

  events: string[] = [];
  opened: boolean | undefined;
  panelOpenState = false;

  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(
    window.location.host
  );

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 0px) and (max-width: 767px)')
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  isTablet$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 768px) and (max-width: 991px)')
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  isScrolling: boolean = false;

  //routes
  routes: Route[];

  //Subscription
  private subscription: Subscription | undefined;

  currentRouteValue = '';

  constructor(
    private router: Router,
    private utilityService: UtilityService,
    private viewportScroller: ViewportScroller
  ) {
    this.routes = router.config;
  }

  ngOnInit() {
    this.subscription = this.utilityService.currentRouteValue$.subscribe(
      (value) => {
        this.currentRouteValue = value;
        const arr = this.currentRouteValue.split('/');
        if (arr.length > 2) {
          switch (arr[1]) {
            case '':
              this.currentRouteValue = '';
              break;
            case 'about':
              this.currentRouteValue = '/about';
              break;
          }
        }
      }
    );
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    // Verifica se la pagina è stata scrollata
    if (window.scrollY > 0) {
      this.isScrolling = true;
    } else {
      this.isScrolling = false;
    }
  }

  //Navigate
  navigate(path: string) {
    this.router.navigate([path]);
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
