import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/core/guards/auth.guard';
import { guestGuard } from './app/core/guards/guest.guard';

export const appRoutes: Routes = [
    // Landing page como página inicial (redireciona para /app se autenticado)
    { path: '', component: Landing, canActivate: [guestGuard] },

    // Dashboard e área autenticada
    {
        path: 'app',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'todos', loadChildren: () => import('./app/features/todos/todos.routes') },
            { path: 'culinarias', loadChildren: () => import('./app/features/culinarias/culinarias.routes') },
            { path: 'account', loadChildren: () => import('./app/pages/account/account.routes') }
        ]
    },

    // Landing page também acessível em /landing
    { path: 'landing', component: Landing, canActivate: [guestGuard] },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
