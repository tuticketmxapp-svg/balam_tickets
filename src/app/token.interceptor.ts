import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './features/services/auth.service';
import { tap } from 'rxjs/operators';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const cookie = inject(CookieService);

  // 👉 No interceptar login
  if (req.url.includes('/api/v1/login')) {
    return next(req);
  }

  const authToken = authService.currentToken;

  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    return next(authReq).pipe(
      tap({
        error: (error) => {
          if (error.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('storage');
            cookie.delete('access_token');
            router.navigate(['/login']);
          }
        }
      })
    );
  }

  return next(req);
};
