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
      },
      {
        path: 'account',
        loadComponent: () => import('./pages/app/account/account.component').then(m => m.AccountComponent)
      },
      {
        path: 'culinarias',
        loadComponent: () => import('./pages/app/culinarias/culinaria-list.component').then(m => m.CulinariaListComponent)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/app/categorias/categoria-list.component').then(m => m.CategoriaListComponent)
      },
      {
        path: 'categorias/new',
        loadComponent: () => import('./pages/app/categorias/categoria-form.component').then(m => m.CategoriaFormComponent)
      },
      {
        path: 'categorias/:id',
        loadComponent: () => import('./pages/app/categorias/categoria-form.component').then(m => m.CategoriaFormComponent)
      },
      {
        path: 'produtos',
        loadComponent: () => import('./pages/app/produtos/produto-list.component').then(m => m.ProdutoListComponent)
      },
      {
        path: 'produtos/new',
        loadComponent: () => import('./pages/app/produtos/produto-form.component').then(m => m.ProdutoFormComponent)
      },
      {
        path: 'produtos/:id',
        loadComponent: () => import('./pages/app/produtos/produto-form.component').then(m => m.ProdutoFormComponent)
      },
      {
        path: 'adicionais',
        loadComponent: () => import('./pages/app/adicionais/adicional-list.component').then(m => m.AdicionalListComponent)
      },
      {
        path: 'adicionais/new',
        loadComponent: () => import('./pages/app/adicionais/adicional-form.component').then(m => m.AdicionalFormComponent)
      },
      {
        path: 'adicionais/:id',
        loadComponent: () => import('./pages/app/adicionais/adicional-form.component').then(m => m.AdicionalFormComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/app/clientes/cliente-list.component').then(m => m.ClienteListComponent)
      },
      {
        path: 'clientes/new',
        loadComponent: () => import('./pages/app/clientes/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./pages/app/clientes/cliente-form.component').then(m => m.ClienteFormComponent)
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
