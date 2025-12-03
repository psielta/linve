import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Área pública - Landing Page (standalone, sem template GovBR)
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [guestGuard]
  },

  // Auth - Login e Register (standalone, sem template GovBR)
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [guestGuard]
  },

  // Área autenticada - COM template GovBR (header/menu/footer)
  {
    path: 'app',
    loadComponent: () => import('./shared/layouts/govbr-layout/govbr-layout.component').then(m => m.GovbrLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/app/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
      // Futuras rotas autenticadas serão adicionadas aqui
    ]
  },

  // Páginas de demonstração do GovBR (standalone, sem template)
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
