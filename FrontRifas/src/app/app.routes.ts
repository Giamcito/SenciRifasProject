import { Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdministrarRifasComponent } from './pages/dashboard/pages/administrar-rifas/administrar-rifas.component';
import { AdministrarVendedorComponent } from './pages/dashboard/pages/administrar-vendedor/administrar-vendedor.component';
import { ConsultarDatosComponent } from './pages/dashboard/pages/consultar-datos/consultar-datos.component';
import { CrearRifasComponent } from './pages/dashboard/pages/crear-rifas/crear-rifas.component';
import { CrearVendedorComponent } from './pages/dashboard/pages/crear-vendedor/crear-vendedor.component';
import { RifasPreviewComponent } from './pages/dashboard/pages/rifas-preview/rifas-preview.component';
import { VentaBoletosComponent } from './pages/dashboard/pages/venta-boletos/venta-boletos.component';
import { FeaturesComponent } from './pages/features/features.component';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: RifasPreviewComponent },
      { path: 'crear-rifas', component: CrearRifasComponent },
      { path: 'administrar-rifas', component: AdministrarRifasComponent },
      { path: 'venta-boletos', component: VentaBoletosComponent },
      { path: 'consultar-datos', component: ConsultarDatosComponent },
      { path: 'crear-vendedor', component: CrearVendedorComponent },
      { path: 'administrar-vendedor', component: AdministrarVendedorComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

