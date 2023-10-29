import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  //Current Route
  public currentRouteValueSubject = new BehaviorSubject<string>('/');
  currentRouteValue$ = this.currentRouteValueSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRouteValueSubject.next(event.urlAfterRedirects);
      }
    });
  }
}
