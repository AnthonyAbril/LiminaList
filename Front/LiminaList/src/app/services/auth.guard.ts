import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanLoad,
  Route,
  UrlSegment
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.estaAutenticado()) {
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    const url = `/${segments.map(s => s.path).join('/')}`;
    if (this.authService.estaAutenticado()) {
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
      return false;
    }
  }
}
