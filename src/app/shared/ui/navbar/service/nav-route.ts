import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavRouteService {
  private readonly router = inject(Router);

  readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  isActiveRoute = (route: string): boolean => {
    if (route === '/') {
      return this.currentRoute() === '/';
    }
    return this.currentRoute().startsWith(route);
  };
}
