import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TenantService } from '../services/tenant.service';

let isRefreshing = false;

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const tenantService = inject(TenantService);
  const router = inject(Router);

  // Não adiciona token para requisições de auth (exceto logout)
  if (isAuthRequest(req.url) && !req.url.includes('/auth/logout')) {
    return next(req);
  }

  // Adiciona o token e organization header
  const clonedReq = addHeaders(req, authService, tenantService);

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se o token expirou, tenta refresh
      if (error.status === 401 && !isAuthRequest(req.url)) {
        return handleTokenRefresh(req, next, authService, tenantService, router);
      }

      return throwError(() => error);
    })
  );
};

function addHeaders(
  req: HttpRequest<unknown>,
  authService: AuthService,
  tenantService: TenantService
): HttpRequest<unknown> {
  const token = authService.getAccessToken();
  const orgId = tenantService.getOrganizationId();

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (orgId) {
    headers = headers.set('X-Organization-Id', orgId.toString());
  }

  return req.clone({ headers });
}

function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  tenantService: TenantService,
  router: Router
) {
  if (isRefreshing) {
    // Se já está fazendo refresh, redireciona para login
    authService.logout();
    return throwError(() => new Error('Session expired'));
  }

  isRefreshing = true;

  return authService.refresh().pipe(
    switchMap(() => {
      isRefreshing = false;
      // Retry a requisição original com o novo token
      const clonedReq = addHeaders(req, authService, tenantService);
      return next(clonedReq);
    }),
    catchError(error => {
      isRefreshing = false;
      authService.logout();
      return throwError(() => error);
    })
  );
}

function isAuthRequest(url: string): boolean {
  return url.includes('/auth/login') ||
         url.includes('/auth/register') ||
         url.includes('/auth/refresh');
}
