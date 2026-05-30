import { Routes } from '@angular/router';
import { redirectIfAuthenticatedGuard, requireAuthenticationGuard } from './guards/auth-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'features',
    loadComponent: () => import('./pages/features/features.component').then(m => m.FeaturesComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'login',
    canMatch: [redirectIfAuthenticatedGuard],
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canMatch: [redirectIfAuthenticatedGuard],
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canMatch: [requireAuthenticationGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/pages/rifas-preview/rifas-preview.component').then(m => m.RifasPreviewComponent)
      },
      {
        path: 'crear-rifas',
        loadComponent: () => import('./pages/dashboard/pages/crear-rifas/crear-rifas.component').then(m => m.CrearRifasComponent)
      },
      {
        path: 'administrar-rifas',
        loadComponent: () => import('./pages/dashboard/pages/administrar-rifas/administrar-rifas.component').then(m => m.AdministrarRifasComponent)
      },
      {
        path: 'administrar-rifas/:id',
        loadComponent: () => import('./pages/dashboard/pages/administrar-rifas/administrar-rifas.component').then(m => m.AdministrarRifasComponent)
      },
      {
        path: 'visualizar-rifas/:id',
        loadComponent: () => import('./pages/dashboard/pages/visualizar-rifas/visualizar-rifas.component').then(m => m.VisualizarRifasComponent)
      },
      {
        path: 'venta-boletos',
        loadComponent: () => import('./pages/dashboard/pages/venta-boletos/venta-boletos.component').then(m => m.VentaBoletosComponent)
      },
      {
        path: 'venta-boletos/:id',
        loadComponent: () => import('./pages/dashboard/pages/venta-boletos/venta-boletos.component').then(m => m.VentaBoletosComponent)
      },
      {
        path: 'consultar-datos',
        loadComponent: () => import('./pages/dashboard/pages/consultar-datos/consultar-datos.component').then(m => m.ConsultarDatosComponent)
      },
      {
        path: 'crear-vendedor',
        loadComponent: () => import('./pages/dashboard/pages/crear-vendedor/crear-vendedor.component').then(m => m.CrearVendedorComponent)
      },
      {
        path: 'administrar-vendedor',
        loadComponent: () => import('./pages/dashboard/pages/administrar-vendedor/administrar-vendedor.component').then(m => m.AdministrarVendedorComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

