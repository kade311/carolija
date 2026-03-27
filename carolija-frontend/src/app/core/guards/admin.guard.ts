import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.isLoggedIn() && authService.isAdmin()){
    return true;
  }

  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/login']);
};
