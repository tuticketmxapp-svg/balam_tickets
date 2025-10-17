import { Routes } from '@angular/router';
import { Home } from './features/components/home/home';
import { SeleccionBoletos } from './features/components/seleccion-boletos/seleccion-boletos';

export const routes: Routes = [
  {
    path: '', // 2. Cuando la ruta esté vacía (la raíz del sitio)
    component: Home // 3. Muestra el HomeComponent
  },
  {
    path: 'seleccionBoletos',
    component: SeleccionBoletos
  },
  {
    path: '**', // 4. Cualquier otra ruta no encontrada
    redirectTo: '' // 5. Redirige a la raíz (que mostrará el HomeComponent)
  }
];
