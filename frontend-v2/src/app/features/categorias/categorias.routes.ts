import { Routes } from '@angular/router';
import { CategoriaListComponent } from './pages/categoria-list/categoria-list.component';
import { CategoriaFormComponent } from './pages/categoria-form/categoria-form.component';

export default [
  { path: '', component: CategoriaListComponent },
  { path: 'new', component: CategoriaFormComponent },
  { path: ':id', component: CategoriaFormComponent }
] as Routes;

