import { Routes } from '@angular/router';
import { Home } from './features/components/home/home';
import { SeleccionBoletos } from './features/components/seleccion-boletos/seleccion-boletos';
import { PagoBoleto } from './features/components/pago-boleto/pago-boleto';
import { ResumenCompra } from './features/components/resumen-compra/resumen-compra';
import { Login } from './features/components/login/login';
import { Signup } from './features/components/signup/signup';
import { DashboardLayoutComponent } from './shared/components/dashboard-layout/dashboard-layout.component';
import { Perfil } from './features/components/perfil/perfil';
import { MisCompras } from './features/components/mis-compras/mis-compras';
import { Ayuda } from './features/components/ayuda/ayuda';
import { MisEventos } from './features/components/mis-eventos/mis-eventos';

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
    path: 'pagoBoleto/:url_event',
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
    path: 'registro',
    component: Signup,
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent, // 1. Carga el layout que contiene el sidebar
    children: [
      {
        path: 'perfil', // URL: /dashboard/perfil
        component: Perfil,
      },
      {
        path: 'mis-compras', // URL: /dashboard/mis-compras
        component: MisCompras,
      },
      {
        path: 'ayuda', // URL: /dashboard/ayuda
        component: Ayuda,
      },
      {
        path: 'mis-eventos', // URL: /dashboard/mis-eventos
        component: MisEventos,
      },
      {
        path: '', // 2. Redirige /dashboard a /dashboard/perfil por defecto
        redirectTo: 'perfil',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**', // 4. Cualquier otra ruta no encontrada
    redirectTo: '' // 5. Redirige a la raíz (que mostrará el HomeComponent)
  }
];
