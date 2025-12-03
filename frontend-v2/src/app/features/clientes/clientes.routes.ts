import { Routes } from '@angular/router';
import { ClienteListComponent } from './pages/cliente-list/cliente-list.component';
import { ClienteFormComponent } from './pages/cliente-form/cliente-form.component';

export default [
  { path: '', component: ClienteListComponent },
  { path: 'new', component: ClienteFormComponent },
  { path: ':id', component: ClienteFormComponent }
] as Routes;
