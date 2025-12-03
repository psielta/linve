import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'formulario',
    loadComponent: () =>
      import('./pages/form/form.component').then((m) => m.FormComponent),
  },
  {
    path: 'cores',
    loadComponent: () =>
      import('./pages/colors/colors.component').then((m) => m.ColorsComponent),
  },
  { path: '**', redirectTo: '' },
];
