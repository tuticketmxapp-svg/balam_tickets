import { Routes } from '@angular/router';
import { Home } from './features/components/home/home';

export const routes: Routes = [
  {
    path: '', // 2. Cuando la ruta esté vacía (la raíz del sitio)
    component: Home // 3. Muestra el HomeComponent
  },
];
