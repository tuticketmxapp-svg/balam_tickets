import { Routes } from '@angular/router';
import { Home } from './features/components/home/home';
import { SeleccionBoletos } from './features/components/seleccion-boletos/seleccion-boletos';
import { PagoBoleto } from './features/components/pago-boleto/pago-boleto';
import { ResumenCompra } from './features/components/resumen-compra/resumen-compra';
import { Login } from './features/login/login';

export const routes: Routes = [
  {
    path: '', // 2. Cuando la ruta esté vacía (la raíz del sitio)
    component: Home // 3. Muestra el HomeComponent
  },
  {
    path: 'seleccionBoletos/:url_event',
    component: SeleccionBoletos
  },
  {
    path: 'pagoBoleto',
    component: PagoBoleto
  },
  {
    path: 'resumenCompra',
    component: ResumenCompra
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '**', // 4. Cualquier otra ruta no encontrada
    redirectTo: '' // 5. Redirige a la raíz (que mostrará el HomeComponent)
  }
];
