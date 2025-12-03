import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Área pública - Landing Page
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [guestGuard]
  },

  // Auth - Login e Register
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [guestGuard]
  },

  // Área autenticada
  {
    path: 'app',
    loadChildren: () => import('./pages/app/app.routes').then(m => m.APP_ROUTES),
    canActivate: [authGuard]
  },

  // Páginas de demonstração do GovBR (podem ser removidas depois)
  {
    path: 'demo/formulario',
    loadComponent: () => import('./pages/form/form.component').then(m => m.FormComponent)
  },
  {
    path: 'demo/cores',
    loadComponent: () => import('./pages/colors/colors.component').then(m => m.ColorsComponent)
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
