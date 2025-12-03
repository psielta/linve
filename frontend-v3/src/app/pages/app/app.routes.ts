import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Futuras rotas:
      // { path: 'todos', loadComponent: () => import('./todos/todos.component').then(m => m.TodosComponent) },
      // { path: 'culinarias', loadComponent: () => import('./culinarias/culinarias.component').then(m => m.CulinariasComponent) },
      // { path: 'categorias', loadComponent: () => import('./categorias/categorias.component').then(m => m.CategoriasComponent) },
      // { path: 'produtos', loadComponent: () => import('./produtos/produtos.component').then(m => m.ProdutosComponent) },
      // { path: 'adicionais', loadComponent: () => import('./adicionais/adicionais.component').then(m => m.AdicionaisComponent) },
      // { path: 'clientes', loadComponent: () => import('./clientes/clientes.component').then(m => m.ClientesComponent) },
      // { path: 'account', loadComponent: () => import('./account/account.component').then(m => m.AccountComponent) },
    ]
  }
];
