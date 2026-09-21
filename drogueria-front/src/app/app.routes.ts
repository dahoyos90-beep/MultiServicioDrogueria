import { Routes } from '@angular/router';
import { Medicamentos } from './pages/medicamentos';
import { Ventas } from './pages/ventas';
import { Reportes } from './pages/reportes';

export const routes: Routes = [
  { path: '', redirectTo: 'medicamentos', pathMatch: 'full' },
  { path: 'medicamentos', component: Medicamentos },
  { path: 'ventas', component: Ventas },
  { path: 'reportes', component: Reportes },
];