import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Add auth headers
  let headers = req.headers;
  const token = authService.accessToken;
  const orgId = authService.organizationId;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (orgId) {
    headers = headers.set('X-Organization-Id', orgId.toString());
  }

  const authReq = req.clone({ headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && authService.refreshToken) {
        return authService.refreshTokens().pipe(
          switchMap(() => {
            // Update headers with new token
            let newHeaders = req.headers;
            if (authService.accessToken) {
              newHeaders = newHeaders.set('Authorization', `Bearer ${authService.accessToken}`);
            }
            if (authService.organizationId) {
              newHeaders = newHeaders.set('X-Organization-Id', authService.organizationId.toString());
            }
            return next(req.clone({ headers: newHeaders }));
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
