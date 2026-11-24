
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot
} from '@angular/router';

import { AuthService } from '../services/auth.services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    if (!this.authService.isLoggedIn()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRole = route.data['role'];
    const userRole = this.authService.getRole();

    if (requiredRole && userRole !== requiredRole) {

      if (userRole === 'Provider') {
        this.router.navigate(['/provider-dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }

      return false;
    }

    return true;
  }
}
