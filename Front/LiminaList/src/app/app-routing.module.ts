import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirigir automáticamente al login
  { path: 'login', component: LoginComponent }, // Pantalla de login
  { path: 'home', loadChildren: () => import('./principal/principal.module').then(m => m.PrincipalModule) /*, canActivate: [AuthGuard] */ }, // Carga diferida del módulo principal
  { path: 'panel/:id', loadChildren: () => import('./panel/panel.module').then(m => m.PanelModule) }, // 🔹 Se agrega el parámetro dinámico `:id`
  { path: '**', redirectTo: '/login' } // Redirigir cualquier ruta desconocida al login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}