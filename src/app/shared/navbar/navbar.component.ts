import {
  Component,
  ElementRef,
  HostListener,
  Input,
  inject,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

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

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    // Verifica se la pagina è stata scrollata
    if (window.scrollY > 0) {
      this.isScrolling = true;
    } else {
      this.isScrolling = false;
    }
  }
}
