import { Routes } from '@angular/router';
import { ProdutoListComponent } from './pages/produto-list/produto-list.component';
import { ProdutoFormComponent } from './pages/produto-form/produto-form.component';

export default [
  { path: '', component: ProdutoListComponent },
  { path: 'new', component: ProdutoFormComponent },
  { path: ':id', component: ProdutoFormComponent }
] as Routes;

