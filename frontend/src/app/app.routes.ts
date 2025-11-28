import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Auth routes (sem layout admin)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Rotas protegidas com AdminLayout
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: {
          breadcrumb: 'Dashboard',
          title: 'Dashboard'
        }
      },
      {
        path: 'todos',
        loadComponent: () => import('./features/todos/components/todo-list/todo-list.component').then(m => m.TodoListComponent),
        data: {
          breadcrumb: 'Tarefas',
          title: 'Gerenciamento de Tarefas'
        }
      },
      {
        path: 'deliveries',
        data: { breadcrumb: 'Entregas' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/deliveries/deliveries-list.component').then(m => m.DeliveriesListComponent),
            data: { title: 'Lista de Entregas' }
          },
          {
            path: 'new',
            loadComponent: () => import('./features/deliveries/delivery-form.component').then(m => m.DeliveryFormComponent),
            data: { breadcrumb: 'Nova Entrega', title: 'Nova Entrega' }
          }
        ]
      },
      {
        path: 'clients',
        data: { breadcrumb: 'Clientes' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/clients/clients-list.component').then(m => m.ClientsListComponent),
            data: { title: 'Lista de Clientes' }
          },
          {
            path: 'new',
            loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent),
            data: { breadcrumb: 'Novo Cliente', title: 'Novo Cliente' }
          }
        ]
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        data: {
          breadcrumb: 'Relatórios',
          title: 'Relatórios'
        }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent),
        data: {
          breadcrumb: 'Usuários',
          title: 'Gerenciamento de Usuários'
        }
      },
      {
        path: 'settings',
        data: { breadcrumb: 'Configurações' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
            data: { title: 'Configurações Gerais' }
          },
          {
            path: 'account',
            loadComponent: () => import('./features/settings/account-settings.component').then(m => m.AccountSettingsComponent),
            data: { breadcrumb: 'Conta', title: 'Configurações da Conta' }
          },
          {
            path: 'profile',
            loadComponent: () => import('./features/settings/profile-settings.component').then(m => m.ProfileSettingsComponent),
            data: { breadcrumb: 'Meu Perfil', title: 'Meu Perfil' }
          },
          {
            path: 'security',
            loadComponent: () => import('./features/settings/security-settings.component').then(m => m.SecuritySettingsComponent),
            data: { breadcrumb: 'Segurança', title: 'Configurações de Segurança' }
          },
          {
            path: 'organization',
            loadComponent: () => import('./features/settings/organization-settings.component').then(m => m.OrganizationSettingsComponent),
            data: { breadcrumb: 'Organização', title: 'Configurações da Organização' }
          }
        ]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        data: {
          breadcrumb: 'Perfil',
          title: 'Meu Perfil'
        }
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        data: {
          breadcrumb: 'Notificações',
          title: 'Todas as Notificações'
        }
      },
      // Redirect padrão para dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'dashboard' }
];
