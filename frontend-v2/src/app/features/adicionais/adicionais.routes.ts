import { Routes } from '@angular/router';
import { AdicionalListComponent } from './pages/adicional-list/adicional-list.component';
import { AdicionalFormComponent } from './pages/adicional-form/adicional-form.component';

export default [
  { path: '', component: AdicionalListComponent },
  { path: 'new', component: AdicionalFormComponent },
  { path: ':id', component: AdicionalFormComponent }
] as Routes;

